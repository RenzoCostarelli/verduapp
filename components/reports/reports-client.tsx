// components/reports/reports-client.tsx
"use client";

import { CsvExportButton } from "@/components/csv-export-button";
import { ReportChart } from "@/components/report-chart";
import { PaymentMethodChart } from "@/components/payment-method-chart";
import { dataService } from "@/lib/data-service";
import type { Entry, DateRange } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { SummaryCards } from "../summary-cards";
import { PeriodFilters } from "../period-filters";
import { getPaymentMethodLabel } from "@/lib/utils";
import { Card } from "pixel-retroui";

type ReportsClientProps = {
  defaultFrom: string; // YYYY-MM-DD
  defaultTo: string; // YYYY-MM-DD
};

function localISODateKey(d: Date | string) {
  const dd = typeof d === "string" ? new Date(d) : d;
  return new Date(dd.getTime() - dd.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

function toISOString(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

export function ReportsClient({ defaultFrom, defaultTo }: ReportsClientProps) {
  // Initialize without effects
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data (allowed effect: external system)
  useEffect(() => {
    (async () => {
      const allEntries = await dataService.getEntries();
      setEntries(allEntries);
      setIsLoading(false);
    })();
  }, []);

  // Handler for period filter changes
  const handlePeriodChange = (range: DateRange) => {
    setFromDate(toISOString(range.from));
    setToDate(toISOString(range.to));
  };

  // Filter by inclusive end date
  const filteredEntries = useMemo(() => {
    if (!fromDate || !toDate) return [];
    const fromD = new Date(`${fromDate}T00:00:00`);
    const toD = new Date(`${toDate}T00:00:00`);
    const toInclusive = new Date(toD);
    toInclusive.setDate(toInclusive.getDate() + 1);

    return entries.filter((e) => {
      const d = new Date(e.date);
      return d >= fromD && d < toInclusive;
    });
  }, [entries, fromDate, toDate]);

  // Summary
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const e of filteredEntries) {
      if (e.type === "income") income += e.amount;
      else if (e.type === "expense") expenses += e.amount;
    }
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    };
  }, [filteredEntries]);

  // Chart data (aggregate per day)
  const chartData = useMemo(() => {
    if (!fromDate || !toDate) return [];

    const bucket = new Map<string, { income: number; expenses: number }>();
    for (const e of filteredEntries) {
      const key = localISODateKey(e.date);
      const cur = bucket.get(key) ?? { income: 0, expenses: 0 };
      if (e.type === "income") cur.income += e.amount;
      if (e.type === "expense") cur.expenses += e.amount;
      bucket.set(key, cur);
    }

    const fromD = new Date(`${fromDate}T00:00:00`);
    const toD = new Date(`${toDate}T00:00:00`);

    const days: { name: string; income: number; expenses: number }[] = [];
    const cursor = new Date(fromD);
    while (cursor <= toD) {
      const key = localISODateKey(cursor);
      const agg = bucket.get(key) ?? { income: 0, expenses: 0 };
      if (agg.income > 0 || agg.expenses > 0) {
        days.push({
          name: cursor.toLocaleDateString("es-AR", {
            month: "short",
            day: "numeric",
          }),
          income: agg.income,
          expenses: agg.expenses,
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [filteredEntries, fromDate, toDate]);

  // Payment method data (aggregate by payment method)
  const paymentMethodData = useMemo(() => {
    const methodTotals = new Map<string, number>();

    for (const e of filteredEntries) {
      const current = methodTotals.get(e.method) ?? 0;
      methodTotals.set(e.method, current + e.amount);
    }

    return Array.from(methodTotals.entries())
      .map(([method, total]) => ({
        name: getPaymentMethodLabel(method),
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredEntries]);

  if (isLoading) {
    return (
      <div className="min-h-[40vh] bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      {/* Period Filters */}

      {/* Summary */}
      <div className="mb-8">
        <SummaryCards
          data={{
            totalIncome,
            totalExpenses,
            balance,
          }}
          dateRange={{
            // inclusive end: pass "to" as the next day's 00:00 so your
            // SummaryCards label shows the correct last day (to - 1ms)
            from: new Date(`${fromDate}T00:00:00`),
            to: new Date(`${toDate}T00:00:00`),
          }}
        />
      </div>
      <Card className="mb-8">
        <h2 className="text-sm font-semibold mb-4 text-foreground">
          Seleccionar Período
        </h2>
        <PeriodFilters onFilterChange={handlePeriodChange} />
      </Card>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Ingresos vs Gastos
          </h2>
          <ReportChart data={chartData} />
        </div>
      )}

      {/* Payment Method Chart */}
      {paymentMethodData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Total por Método de Pago
          </h2>
          <PaymentMethodChart data={paymentMethodData} />
        </div>
      )}

      {/* Export */}
      <div className="flex justify-end">
        <CsvExportButton entries={filteredEntries} />
      </div>
    </>
  );
}
