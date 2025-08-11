// src/components/data/CleanLinkButton.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function CleanLinkButton() {
  return (
    <Link
      to="/app/clean"
      className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      title="Open Clean & Score"
    >
      Clean &amp; Score
    </Link>
  );
}
