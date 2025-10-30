import { NextResponse } from "next/server";

// Optional: move to env if you prefer
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRfXQMUlQx2VVl4Sov3EweAhtMZJ2IwncV9w79ibWYQp2Ncl99nsitk435sMoljDw/pub?output=csv";

type RawRow = {
  id: string;
  type: "income" | "expense";
  amount: string | number;
  date: string; // YYYY-MM-DD
  description?: string;
  method: "cash" | "debit_card" | "credit_card" | "transfer" | "other";
};

function parseCSV(csv: string) {
  // Lightweight CSV parser for simple, comma-separated data without embedded commas
  const lines = csv.trim().split(/\r?\n/);
  const header =
    lines
      .shift()
      ?.split(",")
      .map((h) => h.trim()) ?? [];
  return lines.map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    header.forEach((key, i) => (row[key] = cells[i] ?? ""));
    return row as RawRow;
  });
}

export async function GET() {
  const res = await fetch(SHEET_CSV_URL, {
    // Cache on the server for 60s – adjust as needed
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch sheet" },
      { status: 502 }
    );
  }
  const csv = await res.text();
  const rows = parseCSV(csv);

  // Map to your Entry[]
  const entries = rows
    .filter((r) => r.id && r.type && r.amount && r.date)
    .map((r) => ({
      id: String(r.id),
      type: r.type === "expense" ? "expense" : "income",
      amount: Number(r.amount),
      date: new Date(`${r.date}T00:00:00`),
      description: r.description || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      method: (r.method as any) ?? "other",
    }));

  return NextResponse.json({ entries });
}
