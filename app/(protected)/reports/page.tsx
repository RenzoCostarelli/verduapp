import { ReportsClient } from "@/components/reports/reports-client";
import { getNowInArgentina } from "@/lib/formatting";
import Link from "next/link";
import { Button } from "pixel-retroui";

function todayRangeISO() {
  const now = getNowInArgentina();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const toISO = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  return { from: toISO(today), to: toISO(tomorrow) };
}

export default function Page() {
  const { from, to } = todayRangeISO();

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Análisis de flujo de caja
            </p>
          </div>
          <Link href={"/"}>
            <Button bg="lightgreen">
              <span className="mr-1">◀</span>
            </Button>
          </Link>
        </div>

        {/* Client area */}
        <ReportsClient defaultFrom={from} defaultTo={to} />
      </div>
    </main>
  );
}
