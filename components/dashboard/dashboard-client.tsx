"use client";

import { EntriesTable } from "@/components/entries-table";
import { PeriodFilters } from "@/components/period-filters";
import { SummaryCards } from "@/components/summary-cards";
import { dataService } from "@/lib/data-service";
import type { DateRange, Entry, SummaryData } from "@/lib/types";
import { Plus } from "lucide-react";
import { Button, Popup } from "pixel-retroui";
import { useEffect, useMemo, useState } from "react";
import { EntryForm } from "../entry-form";
import FiltersCard from "./filters-card";
import HeaderBar from "./header-bar";
import NavBar from "../ui/nav-bar";

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

  // Load entries from Supabase on mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const allEntries = await dataService.getEntries();
        setEntries(allEntries);
      } catch (error) {
        console.error("Error loading entries:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEntries();
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

  const handleUpdateEntry = (updatedEntry: Entry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
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
            onUpdate={handleUpdateEntry}
          />
        </div>
        <NavBar />
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
            onClose={closePopup}
            onSubmit={handleAddEntry}
          />
        </Popup>
      </div>
    </main>
  );
}
