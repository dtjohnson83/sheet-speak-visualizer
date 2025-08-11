// src/pages/Clean.tsx
import React from "react";
import CleanAndScorePanel from "@/components/data/CleanAndScorePanel";

export default function CleanPage() {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clean &amp; Score</h1>
          <p className="text-sm text-muted-foreground">
            Upload a CSV/XLSX, standardize formats, remove duplicates, score quality, and export a cleaned bundle.
          </p>
        </div>
      </header>
      <CleanAndScorePanel />
    </div>
  );
}
