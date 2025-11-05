// components/reports/reports-client.tsx
"use client";

import { CsvExportButton } from "@/components/csv-export-button";
import { PaymentMethodChart } from "@/components/payment-method-chart";
import { ReportChart } from "@/components/report-chart";
import { dataService } from "@/lib/data-service";
import type { Entry } from "@/lib/types";
import { getPaymentMethodLabel } from "@/lib/utils";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button, Popup } from "pixel-retroui";
import { useEffect, useMemo, useState } from "react";
import { EntriesTable } from "../entries-table";
import { FilterParams, Filters } from "../filters";
import { SummaryCards } from "../summary-cards";

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
  // State
  const [entries, setEntries] = useState<Entry[]>([]);
  const [paginatedEntries, setPaginatedEntries] = useState<Entry[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<
    Array<{ id: string; email: string }>
  >([]);
  const [filters, setFilters] = useState<FilterParams>({
    fromDate: defaultFrom,
    toDate: defaultTo,
    period: "today",
  });
  const [isChartsExpanded, setIsChartsExpanded] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Load all entries for stats and charts
  useEffect(() => {
    (async () => {
      const allEntries = await dataService.getEntries();
      const users = await dataService.getEntryCreators();
      setEntries(allEntries);
      setAvailableUsers(users);
      setIsLoading(false);
    })();
  }, []);

  // Load paginated entries for table with filters
  useEffect(() => {
    const loadPaginatedEntries = async () => {
      setIsPaginationLoading(true);
      try {
        const { entries, total } = await dataService.getPaginatedEntries({
          page: currentPage,
          limit: 10,
          createdBy: filters.createdBy,
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          paymentMethod:
            filters.paymentMethod === "all" ? undefined : filters.paymentMethod,
          entryType:
            filters.entryType === "all" ? undefined : filters.entryType,
        });
        setPaginatedEntries(entries);
        setTotalEntries(total);
      } catch (error) {
        console.error("Error loading paginated entries:", error);
      } finally {
        setIsPaginationLoading(false);
      }
    };
    loadPaginatedEntries();
  }, [currentPage, filters]);

  // Handler for filter changes
  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    setIsFiltersOpen(false); // Close the popup after applying filters
  };

  // Handler for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handler for delete entry
  const handleDeleteEntry = async (id: string) => {
    await dataService.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    // Reload current page after deletion
    const { entries, total } = await dataService.getPaginatedEntries({
      page: currentPage,
      limit: 10,
      createdBy: filters.createdBy,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      paymentMethod:
        filters.paymentMethod === "all" ? undefined : filters.paymentMethod,
      entryType: filters.entryType === "all" ? undefined : filters.entryType,
    });
    setPaginatedEntries(entries);
    setTotalEntries(total);
  };

  // Handler for update entry
  const handleUpdateEntry = (updatedEntry: Entry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
    setPaginatedEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
  };

  // Filter entries based on current filters
  const filteredEntries = useMemo(() => {
    if (!filters.fromDate || !filters.toDate) return entries;

    const fromD = new Date(`${filters.fromDate}T00:00:00`);
    const toD = new Date(`${filters.toDate}T00:00:00`);
    const toInclusive = new Date(toD);
    toInclusive.setDate(toInclusive.getDate() + 1);

    return entries.filter((e) => {
      const d = new Date(e.date);
      const dateMatch = d >= fromD && d < toInclusive;

      // Apply additional filters
      const createdByMatch =
        !filters.createdBy || e.created_by === filters.createdBy;
      const paymentMethodMatch =
        !filters.paymentMethod ||
        filters.paymentMethod === "all" ||
        e.method === filters.paymentMethod;
      const entryTypeMatch =
        !filters.entryType ||
        filters.entryType === "all" ||
        e.type === filters.entryType;

      return (
        dateMatch && createdByMatch && paymentMethodMatch && entryTypeMatch
      );
    });
  }, [entries, filters]);

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
    if (!filters.fromDate || !filters.toDate) return [];

    const bucket = new Map<string, { income: number; expenses: number }>();
    for (const e of filteredEntries) {
      const key = localISODateKey(e.date);
      const cur = bucket.get(key) ?? { income: 0, expenses: 0 };
      if (e.type === "income") cur.income += e.amount;
      if (e.type === "expense") cur.expenses += e.amount;
      bucket.set(key, cur);
    }

    const fromD = new Date(`${filters.fromDate}T00:00:00`);
    const toD = new Date(`${filters.toDate}T00:00:00`);

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
  }, [filteredEntries, filters.fromDate, filters.toDate]);

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
      {/* Summary */}
      <div className="mb-8">
        <SummaryCards
          data={{
            totalIncome,
            totalExpenses,
            balance,
          }}
          dateRange={
            filters.fromDate && filters.toDate
              ? {
                  from: new Date(`${filters.fromDate}T00:00:00`),
                  to: new Date(`${filters.toDate}T00:00:00`),
                }
              : undefined
          }
        />
      </div>

      {/* Filters Button */}
      <div className="mb-8">
        <Button
          onClick={() => setIsFiltersOpen(true)}
          className="flex items-center gap-2"
          bg="white"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {/* Filters Popup */}
      <Popup
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        bg="lightgreen"
        baseBg="white"
      >
        <div className="max-w-[90vw] md:max-w-2xl">
          {/* <h3 className="text-lg font-bold mb-4">Filtros</h3> */}
          <Filters
            onFilterChange={handleFilterChange}
            availableUsers={availableUsers}
          />
        </div>
      </Popup>

      {/* Entries Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Movimientos
        </h2>
        <EntriesTable
          entries={paginatedEntries}
          totalEntries={totalEntries}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onDelete={handleDeleteEntry}
          onUpdate={handleUpdateEntry}
          isLoading={isPaginationLoading}
        />
      </div>

      {/* Collapsible Charts Section */}
      <div className="mb-8">
        {/* <Card> */}
        <Button
          onClick={() => setIsChartsExpanded(!isChartsExpanded)}
          className="flex-1 flex items-center justify-between text-left"
          bg="white"
        >
          <h2 className="text-lg font-semibold text-foreground">Gráficos</h2>
          {isChartsExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </Button>

        {isChartsExpanded && (
          <div className="mt-4 space-y-6">
            {/* Chart */}
            {chartData.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-4 text-foreground">
                  Ingresos vs Gastos
                </h3>
                <ReportChart data={chartData} />
              </div>
            )}

            {/* Payment Method Chart */}
            {paymentMethodData.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-4 text-foreground">
                  Total por Método de Pago
                </h3>
                <PaymentMethodChart data={paymentMethodData} />
              </div>
            )}
          </div>
        )}
        {/* </Card> */}
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <CsvExportButton entries={filteredEntries} />
      </div>
    </>
  );
}
