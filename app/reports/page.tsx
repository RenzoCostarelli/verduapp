import { ReportsClient } from "@/components/reports/reports-client";
import { getNowInArgentina } from "@/lib/formatting";

function monthRangeISO() {
  const now = getNowInArgentina();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const toISO = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  return { from: toISO(monthStart), to: toISO(monthEnd) };
}

export default function Page() {
  const { from, to } = monthRangeISO();

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Análisis de flujo de caja
            </p>
          </div>
        </div>

        {/* Client area */}
        <ReportsClient defaultFrom={from} defaultTo={to} />
      </div>
    </main>
  );
}
