// web/src/components/CleanDataUploader.tsx
import React, { useState } from "react";

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

export default function CleanDataUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [cleanedCsv, setCleanedCsv] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please choose a CSV or XLSX file.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);

      const url =
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clean-and-score`;
      const res = await fetch(url, {
        method: "POST",
        body: fd,
        headers: {
          // Optional: pass anon key if your function requires it
          // "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Cleaning failed");

      setReport(data.report);
      setCleanedCsv(data.cleanedCsv);
      setMarkdown(data.markdown);
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
    a.href = url;
    const base = file?.name?.replace(/\.(csv|xlsx|xls)$/i, "") || "dataset";
    a.download = `${base}__cleaned.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl mx-auto p-4 text-sm">
      <h2 className="text-xl font-semibold mb-3">Clean & Score Dataset</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="file"
          accept=".csv, .xlsx, .xls, .txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full"
        />
        <button
          disabled={loading || !file}
          className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? "Cleaning..." : "Upload & Clean"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 border border-red-300 bg-red-50 text-red-800 rounded">
          {error}
        </div>
      )}

      {report && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Data Quality Score</h3>
            <span className="text-2xl font-bold">
              {report.score}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Original Rows" value={report.originalRows} />
            <Stat label="Cleaned Rows" value={report.cleanedRows} />
            <Stat label="Duplicates Removed" value={report.duplicatesRemoved} />
          </div>

          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
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

          <div className="flex gap-3">
            <button
              onClick={downloadCleaned}
              className="px-3 py-2 rounded bg-emerald-600 text-white"
            >
              Download Cleaned CSV
            </button>

            {markdown && (
              <button
                onClick={() => {
                  const blob = new Blob([markdown!], {
                    type: "text/markdown;charset=utf-8",
                  });
                  const url = URL.createObjectURL(blob);
                  const base = file?.name?.replace(/\.(csv|xlsx|xls)$/i, "") ||
                    "dataset";
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${base}__quality-report.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 rounded bg-slate-700 text-white"
              >
                Download Quality Report (MD)
            </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-3 border rounded bg-white">
      <div className="text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Th({
  children,
  align,
}: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th className={`px-3 py-2 text-${align ?? "left"} font-medium`}>
      {children}
    </th>
  );
}

function Td({
  children,
  align,
}: { children: React.ReactNode; align?: "left" | "right" }) {
  return <td className={`px-3 py-2 text-${align ?? "left"}`}>{children}</td>;
}
