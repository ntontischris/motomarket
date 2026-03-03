"use client";

import { useState } from "react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  maxRows?: number;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  maxRows,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "number" && typeof bv === "number") {
      return sortDir === "asc" ? av - bv : bv - av;
    }
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const rows = maxRows ? sorted.slice(0, maxRows) : sorted;

  return (
    <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 font-medium text-[#888888] ${
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                } ${col.sortable ? "cursor-pointer hover:text-[#e5e5e5] select-none" : ""}`}
                onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
              >
                {col.label}
                {col.sortable && sortKey === String(col.key) && (
                  <span className="ml-1 text-[#f97316]">{sortDir === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[#1e1e1e] hover:bg-[#1a1a1a] transition-colors"
            >
              {columns.map(col => (
                <td
                  key={String(col.key)}
                  className={`px-4 py-3 text-[#e5e5e5] ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {col.render ? col.render(row) : String(row[col.key as string] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[#555555]">
                Δεν υπάρχουν δεδομένα
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
