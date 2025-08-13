// supabase/functions/clean-and-score/index.ts
// Deno Deploy / Supabase Edge Function
// Endpoint: POST /functions/v1/clean-and-score
// Content-Type: multipart/form-data  (field name: "file")

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { MultipartReader } from "https://deno.land/std@0.224.0/mime/multipart.ts";
import { readCSV } from "https://deno.land/std@0.224.0/csv/mod.ts";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

type Row = Record<string, unknown>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return json(
        { error: "Send multipart/form-data with a 'file' field." },
        400,
      );
    }

    // ---- Parse multipart ----
    const boundary = contentType.split("boundary=")[1];
    if (!boundary) return json({ error: "Bad multipart boundary." }, 400);

    const mr = new MultipartReader(req.body!, boundary);
    const form = await mr.readForm({ maxFileSize: 50_000_000 }); // 50MB
    const file = form.file("file");
    if (!file) return json({ error: "Missing 'file' field." }, 400);

    const bytes = await Deno.readFile(file.filename!);
    const ext = (file.filename || "").toLowerCase();

    // ---- Load rows ----
    let rows: Row[] = [];
    if (ext.endsWith(".csv")) {
      const text = new TextDecoder().decode(bytes);
      rows = await csvToRows(text);
    } else if (ext.endsWith(".xlsx") || ext.endsWith(".xls")) {
      rows = xlsxToRows(bytes);
    } else if (ext.endsWith(".txt")) {
      const text = new TextDecoder().decode(bytes);
      rows = await csvToRows(text); // treat as CSV
    } else {
      return json({ error: "Unsupported file type. Use CSV or XLSX." }, 400);
    }

    if (rows.length === 0) {
      return json({ error: "No data rows detected." }, 400);
    }

    // ---- Clean & Analyze ----
    const cleaned = cleanRows(rows);
    const report = buildQualityReport(rows, cleaned);
    const cleanedCsv = rowsToCsv(cleaned);

    const markdown = reportToMarkdown(report);

    return new Response(
      JSON.stringify({ cleanedCsv, report, markdown }, null, 2),
      {
        headers: {
          ...corsHeaders,
          "content-type": "application/json",
        },
        status: 200,
      },
    );
  } catch (err) {
    console.error(err);
    return json({ error: "Internal error", details: `${err}` }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "content-type": "application/json" },
    status,
  });
}

function base64ToBytes(b64: string): Uint8Array {
  const normalized = b64.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(normalized);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** CSV -> array of objects */
async function csvToRows(csvText: string): Promise<Row[]> {
  const records: Row[] = [];
  const reader = await readCSV(new StringReader(csvText), { skipFirstRow: false });
  // First row must be header
  const it = reader[Symbol.asyncIterator]();
  const first = await it.next();
  if (first.done) return [];
  const headers = first.value.map((h: string) => (h ?? "").trim());

  records.push(...(await collectRows(it, headers)));
  return records;
}

// Helper since std/csv doesn't export a simple string reader
class StringReader implements Deno.Reader {
  private buf: Uint8Array;
  private offset = 0;
  constructor(text: string) {
    this.buf = new TextEncoder().encode(text);
  }
  read(p: Uint8Array): Promise<number | null> {
    if (this.offset >= this.buf.length) return Promise.resolve(null);
    const n = Math.min(p.length, this.buf.length - this.offset);
    p.set(this.buf.subarray(this.offset, this.offset + n));
    this.offset += n;
    return Promise.resolve(n);
  }
}

async function collectRows(
  it: AsyncIterator<string[]>,
  headers: string[],
): Promise<Row[]> {
  const out: Row[] = [];
  for await (const arr of { [Symbol.asyncIterator]: () => it } as any) {
    const row: Row = {};
    headers.forEach((h, i) => (row[h || `col_${i + 1}`] = arr[i] ?? ""));
    out.push(row);
  }
  return out;
}

/** XLSX -> array of objects (from first sheet) */
function xlsxToRows(bytes: Uint8Array): Row[] {
  const wb = XLSX.read(bytes, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(ws, { raw: false, defval: "" }) as Row[];
}

/** Clean operations: trim, unify nulls, type inference, numeric/date coercion, remove dups */
function cleanRows(rows: Row[]): Row[] {
  const headers = Object.keys(rows[0]);
  const normalized = rows.map((r) => {
    const o: Row = {};
    for (const k of headers) {
      o[k] = normalizeCell(r[k]);
    }
    return o;
  });

  // Infer column types (string|number|date)
  const types = inferTypes(normalized, headers);

  // Coerce by inferred types
  const coerced = normalized.map((r) => {
    const o: Row = {};
    for (const k of headers) {
      const t = types[k];
      const v = r[k];
      if (v === null || v === undefined || v === "") {
        o[k] = null;
        continue;
      }
      if (t === "number") {
        const num = toNumber(v);
        o[k] = Number.isFinite(num) ? num : null;
      } else if (t === "date") {
        const d = toDateISO(v);
        o[k] = d || null;
      } else {
        o[k] = String(v);
      }
    }
    return o;
  });

  // Remove duplicate rows (deep)
  const seen = new Set<string>();
  const deduped: Row[] = [];
  for (const row of coerced) {
    const key = JSON.stringify(row);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(row);
    }
  }

  return deduped;
}

function normalizeCell(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    const s = v.trim();
    if (s === "" || s.toLowerCase() === "na" || s.toLowerCase() === "null") {
      return null;
    }
    return s;
  }
  return v;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  const s = String(v).replace(/[, ]/g, "");
  const n = Number(s);
  return n;
}

function toDateISO(v: unknown): string | null {
  const s = String(v).trim();
  // Try common formats first (YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY)
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const mdY = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  let d: Date | null = null;

  if (isoMatch) {
    d = new Date(s);
  } else if (mdY) {
    // assume MM/DD/YYYY when ambiguous
    const mm = Number(mdY[1]);
    const dd = Number(mdY[2]);
    let yy = Number(mdY[3]);
    if (yy < 100) yy += 2000;
    d = new Date(yy, mm - 1, dd);
  } else {
    const t = Date.parse(s);
    if (!Number.isNaN(t)) d = new Date(t);
  }

  if (!d || isNaN(d.getTime())) return null;
  const iso = d.toISOString().slice(0, 10);
  return iso;
}

function inferTypes(rows: Row[], headers: string[]) {
  const types: Record<string, "string" | "number" | "date"> = {};
  for (const k of headers) {
    const vals = rows
      .map((r) => r[k])
      .filter((v) => v !== null && v !== undefined && v !== "");
    let numCount = 0;
    let dateCount = 0;
    const N = Math.max(vals.length, 1);

    for (const v of vals) {
      if (isProbablyNumber(v)) numCount++;
      else if (isProbablyDate(v)) dateCount++;
    }

    if (numCount / N >= 0.6) types[k] = "number";
    else if (dateCount / N >= 0.6) types[k] = "date";
    else types[k] = "string";
  }
  return types;
}

function isProbablyNumber(v: unknown): boolean {
  if (typeof v === "number") return true;
  const s = String(v).trim().replace(/[, ]/g, "");
  if (s === "" || /^[-+]?(\.)?$/.test(s)) return false;
  return !Number.isNaN(Number(s));
}

function isProbablyDate(v: unknown): boolean {
  const s = String(v).trim();
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(s) ||
    /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(s) ||
    !Number.isNaN(Date.parse(s))
  );
}

function rowsToCsv(rows: Row[]): string {
  const headers = Object.keys(rows[0] ?? {});
  const escape = (x: unknown) => {
    const s = x === null || x === undefined ? "" : String(x);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => escape(r[h])).join(","));
  }
  return lines.join("\n");
}

/** Build quality metrics */
function buildQualityReport(original: Row[], cleaned: Row[]) {
  const headers = Object.keys(cleaned[0] ?? {});
  const totalOriginal = original.length;
  const totalCleaned = cleaned.length;
  const duplicatesRemoved = totalOriginal - totalCleaned;

  // Missingness and type consistency
  const perColumn = headers.map((h) => {
    const values = cleaned.map((r) => r[h]);
    const missing = values.filter((v) => v === null || v === "").length;
    const missingPct = (missing / cleaned.length) * 100;

    const numeric = values.filter((v) => typeof v === "number").length;
    const date = values.filter(
      (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v),
    ).length;
    const str = cleaned.length - numeric - date - missing;
    const dominant =
      numeric >= date && numeric >= str
        ? "number"
        : date >= numeric && date >= str
        ? "date"
        : "string";

    // crude outlier count using z-score on numeric
    let outliers = 0;
    if (dominant === "number" && numeric > 3) {
      const nums = values.filter((v) => typeof v === "number") as number[];
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const sd = Math.sqrt(
        nums.reduce((a, b) => a + (b - mean) ** 2, 0) / (nums.length - 1),
      );
      if (sd > 0) {
        outliers = nums.filter((n) => Math.abs((n - mean) / sd) > 3).length;
      }
    }

    return {
      column: h,
      rows: cleaned.length,
      missing,
      missingPct: round(missingPct),
      dominantType: dominant,
      numericCount: numeric,
      dateCount: date,
      stringCount: str,
      outliers,
    };
  });

  // Overall score (0-100)
  const missingPenalty =
    perColumn.reduce((a, c) => a + c.missingPct, 0) / Math.max(perColumn.length, 1);
  const dupPenalty = (duplicatesRemoved / Math.max(totalOriginal, 1)) * 100;
  const outlierPenalty =
    perColumn.reduce((a, c) => a + c.outliers, 0) /
    Math.max(totalCleaned, 1) *
    5; // light penalty

  const score = Math.max(
    0,
    round(100 - 0.6 * missingPenalty - 0.3 * dupPenalty - 0.1 * outlierPenalty),
  );

  return {
    originalRows: totalOriginal,
    cleanedRows: totalCleaned,
    duplicatesRemoved,
    score,
    columns: perColumn,
  };
}

function reportToMarkdown(r: ReturnType<typeof buildQualityReport>): string {
  const lines: string[] = [];
  lines.push(`# Data Quality Report`);
  lines.push(`**Overall Score:** ${r.score}/100`);
  lines.push(
    `**Rows:** original ${r.originalRows} → cleaned ${r.cleanedRows} (removed ${r.duplicatesRemoved} duplicates)`,
  );
  lines.push(``);
  lines.push(`## Columns`);
  lines.push(
    `| Column | Missing % | Type | #Numeric | #Date | #String | Outliers |`,
  );
  lines.push(`|---|---:|---|---:|---:|---:|---:|`);
  for (const c of r.columns) {
    lines.push(
      `| ${c.column} | ${c.missingPct}% | ${c.dominantType} | ${c.numericCount} | ${c.dateCount} | ${c.stringCount} | ${c.outliers} |`,
    );
  }
  return lines.join("\n");
}

function round(n: number, d = 1) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}
