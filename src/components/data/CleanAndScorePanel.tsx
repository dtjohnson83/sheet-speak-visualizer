// src/components/data/CleanAndScorePanel.tsx
import React, { useMemo, useRef, useState } from "react";
import JSZip from "jszip";

type QualityColumn = {
  column: string;
  rows: number;
  missing: number;
  missingPct: number;
  dominantType: string;
  numericCount: number;
  dateCount: number;
  stringCount: number;
  outliers: number;
};

type Report = {
  originalRows: number;
  cleanedRows: number;
  duplicatesRemoved: number;
  score: number;
  columns: QualityColumn[];
};

export default function CleanAndScorePanel() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [cleanedCsv, setCleanedCsv] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);

  const c1 = useRef<HTMLCanvasElement>(null);
  const c2 = useRef<HTMLCanvasElement>(null);
  const c3 = useRef<HTMLCanvasElement>(null);

  const supabaseFuncUrl = useMemo(() => {
    const base = import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, "");
    return base ? `${base}/functions/v1/clean-and-score` : "";
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) return setError("Choose a CSV or XLSX file.");
    if (!supabaseFuncUrl) return setError("VITE_SUPABASE_URL is not set.");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      const res = await fetch(supabaseFuncUrl, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Clean & Score failed.");

      setReport(data.report);
      setCleanedCsv(data.cleanedCsv);
      setMarkdown(data.markdown);

      // Draw mini-thumbnails after render
      setTimeout(() => drawThumbs(data.report, c1.current, c2.current, c3.current), 50);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function downloadCleaned() {
    if (!cleanedCsv) return;
    const blob = new Blob([cleanedCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = file?.name?.replace(/\.(csv|xlsx|xls)$/i, "") || "dataset";
    a.href = url;
    a.download = `${base}__cleaned.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadZip() {
    if (!cleanedCsv || !report) return;
    const base = file?.name?.replace(/\.(csv|xlsx|xls)$/i, "") || "dataset";
    const zip = new JSZip();

    zip.file(`${base}__cleaned.csv`, cleanedCsv, { binary: false });
    if (markdown) zip.file(`${base}__quality-report.md`, markdown, { binary: false });

    const [b1, b2, b3] = await Promise.all([toBlob(c1.current), toBlob(c2.current), toBlob(c3.current)]);
    if (b1) zip.file(`${base}__thumb-score.png`, b1);
    if (b2) zip.file(`${base}__thumb-missingness.png`, b2);
    if (b3) zip.file(`${base}__thumb-types.png`, b3);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}__cleaned_bundle.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <h4 className="text-base md:text-lg font-semibold">Clean &amp; Score Dataset</h4>
          <p className="text-sm text-muted-foreground">
            Upload a CSV or Excel file. We’ll standardize formats, remove duplicates, score quality, and let you export results.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              accept=".csv, .xlsx, .xls, .txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-input file:bg-secondary file:px-3 file:py-2 file:text-foreground"
            />
            <button
              disabled={!file || loading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Cleaning..." : "Run Clean & Score"}
            </button>

            {cleanedCsv && (
              <>
                <button
                  type="button"
                  onClick={downloadCleaned}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Download Cleaned CSV
                </button>
                <button
                  type="button"
                  onClick={downloadZip}
                  className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white"
                >
                  Download ZIP
                </button>
              </>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {report && (
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Quality Score" value={`${report.score}/100`} />
              <Stat label="Original Rows" value={report.originalRows} />
              <Stat label="Cleaned Rows" value={report.cleanedRows} />
              <Stat label="Duplicates Removed" value={report.duplicatesRemoved} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Thumb title="Score (synthetic trend)">
                <canvas ref={c1} width={360} height={140} />
              </Thumb>
              <Thumb title="Missingness by Column">
                <canvas ref={c2} width={360} height={140} />
              </Thumb>
              <Thumb title="Dominant Types by Column">
                <canvas ref={c3} width={360} height={140} />
              </Thumb>
            </div>

            <div className="overflow-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <Th>Column</Th>
                    <Th align="right">Missing %</Th>
                    <Th>Type</Th>
                    <Th align="right">#Numeric</Th>
                    <Th align="right">#Date</Th>
                    <Th align="right">#String</Th>
                    <Th align="right">Outliers</Th>
                  </tr>
                </thead>
                <tbody>
                  {report.columns.map((c) => (
                    <tr key={c.column} className="border-t">
                      <Td>{c.column}</Td>
                      <Td align="right">{c.missingPct}%</Td>
                      <Td>{c.dominantType}</Td>
                      <Td align="right">{c.numericCount}</Td>
                      <Td align="right">{c.dateCount}</Td>
                      <Td align="right">{c.stringCount}</Td>
                      <Td align="right">{c.outliers}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ——— helpers ——— */
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
function Th({ children, align }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <th className={`px-3 py-2 text-${align ?? "left"} font-medium`}>{children}</th>;
}
function Td({ children, align }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <td className={`px-3 py-2 text-${align ?? "left"}`}>{children}</td>;
}
function Thumb({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="mb-2 text-sm font-medium">{title}</div>
      {children}
    </div>
  );
}

function drawThumbs(report: Report, a?: HTMLCanvasElement | null, b?: HTMLCanvasElement | null, c?: HTMLCanvasElement | null) {
  // 1) score sparkline
  if (a) {
    const ctx = a.getContext("2d")!;
    const W = a.width, H = a.height;
    ctx.clearRect(0, 0, W, H);
    const n = 24;
    const pts = Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      const jitter = (Math.random() - 0.5) * 8;
      const v = Math.max(0, Math.min(100, report.score + jitter - 8 * (1 - t)));
      return v;
    });
    ctx.strokeStyle = "#4F46E5"; ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach((v, i) => {
      const x = 20 + (i * (W - 30)) / (n - 1);
      const y = H - 15 - (v * (H - 30)) / 100;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // 2) missingness bars
  if (b) {
    const ctx = b.getContext("2d")!;
    const W = b.width, H = b.height;
    ctx.clearRect(0, 0, W, H);
    const cols = report.columns.slice(0, 12);
    const bw = (W - 40) / cols.length;
    ctx.fillStyle = "#0EA5E9";
    cols.forEach((col, i) => {
      const x = 20 + i * bw + 4;
      const h = (col.missingPct / 100) * (H - 30);
      ctx.fillRect(x, H - 15 - h, bw - 8, h);
    });
  }

  // 3) stacked type bars
  if (c) {
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const cols = report.columns.slice(0, 10);
    const bw = (W - 40) / cols.length;
    cols.forEach((col, i) => {
      const total = Math.max(1, col.rows);
      const x = 20 + i * bw + 6;
      let y = H - 15;
      // strings
      const hs = (col.stringCount / total) * (H - 30);
      ctx.fillStyle = "#A1A1AA"; ctx.fillRect(x, y - hs, bw - 12, hs); y -= hs;
      // dates
      const hd = (col.dateCount / total) * (H - 30);
      ctx.fillStyle = "#22C55E"; ctx.fillRect(x, y - hd, bw - 12, hd); y -= hd;
      // numbers
      const hn = (col.numericCount / total) * (H - 30);
      ctx.fillStyle = "#6366F1"; ctx.fillRect(x, y - hn, bw - 12, hn);
    });
  }
}

function toBlob(canvas?: HTMLCanvasElement | null): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!canvas) return resolve(null);
    canvas.toBlob((b) => resolve(b), "image/png");
  });
}
