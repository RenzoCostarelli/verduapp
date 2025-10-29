// components/dashboard/dashboard-client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { SummaryCards } from "@/components/summary-cards";
import { PeriodFilters } from "@/components/period-filters";
import { EntriesTable } from "@/components/entries-table";
import { EntryFormModal } from "@/components/entry-form-modal";
import { MobileFAB } from "@/components/mobile-fab";
import { dataService } from "@/lib/data-service";
import type { Entry, DateRange, SummaryData } from "@/lib/types";
import HeaderBar from "./header-bar";
import FiltersCard from "./filters-card";
import { Button, Popup } from "pixel-retroui";
import { EntryForm } from "../entry-form";
import { Plus } from "lucide-react";

type Props = {
  defaultDateRange: DateRange;
  reportsHref: string;
  title: string;
  subtitle?: string;
};

export function DashboardClient({
  defaultDateRange,
  reportsHref,
  title,
  subtitle,
}: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | null>(
    defaultDateRange
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  // Initialize local storage/IndexedDB data on mount (client-only)
  useEffect(() => {
    const initializeData = async () => {
      await dataService.seedIfEmpty();
      const allEntries = await dataService.getEntries();
      setEntries(allEntries);
      setIsLoading(false);
    };
    initializeData();
  }, []);

  // Derived data (no extra effects)
  const filteredEntries = useMemo(() => {
    if (!dateRange) return entries;
    return entries.filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= dateRange.from && entryDate < dateRange.to;
    });
  }, [entries, dateRange]);

  const summary: SummaryData = useMemo(() => {
    const totalIncome = filteredEntries
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = filteredEntries
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  }, [filteredEntries]);

  // Handlers
  const handleAddEntry = async (newEntry: Entry) => {
    setEntries((prev) => [...prev, newEntry]);
    setIsModalOpen(false);
  };

  const handleDeleteEntry = async (id: string) => {
    await dataService.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleFilterChange = (range: DateRange) => setDateRange(range);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <HeaderBar
          title={title}
          subtitle={subtitle}
          reportsHref={reportsHref}
          onNewMovement={() => setIsModalOpen(true)}
        />

        <div className="mb-8">
          <SummaryCards data={summary} dateRange={dateRange || undefined} />
        </div>

        <div className="mb-8">
          <FiltersCard>
            <PeriodFilters onFilterChange={handleFilterChange} />
          </FiltersCard>
        </div>

        <div className="mb-8">
          <EntriesTable
            entries={filteredEntries}
            onDelete={handleDeleteEntry}
          />
        </div>

        <Button
          onClick={openPopup}
          bg="green"
          textColor="white"
          className="fixed bottom-6 right-6 md:hidden z-40"
          aria-label="Agregar nuevo movimiento"
        >
          <Plus className="w-6 h-6" />
        </Button>

        <Popup
          isOpen={isPopupOpen}
          onClose={closePopup}
          bg="lightpink"
          baseBg="palegreen"
        >
          <EntryForm
            isOpen={isPopupOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddEntry}
          />
        </Popup>
      </div>

      {/* <MobileFAB onClick={() => setIsModalOpen(true)} /> */}
    </main>
  );
}
