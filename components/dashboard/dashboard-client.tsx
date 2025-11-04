"use client";

import { EntriesTable } from "@/components/entries-table";
import { PeriodFilters } from "@/components/period-filters";
import { SummaryCards } from "@/components/summary-cards";
import { dataService } from "@/lib/data-service";
import { getNowInArgentina } from "@/lib/formatting";
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
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [paginatedEntries, setPaginatedEntries] = useState<Entry[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  // Load all entries for today's stats only
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const allEntries = await dataService.getEntries();
        setAllEntries(allEntries);
      } catch (error) {
        console.error("Error loading entries:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEntries();
  }, []);

  // Load paginated entries for the table
  useEffect(() => {
    const loadPaginatedEntries = async () => {
      setIsPaginationLoading(true);
      try {
        const { entries, total } = await dataService.getPaginatedEntries({
          page: currentPage,
          limit: 10,
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
  }, [currentPage]);

  // Calculate today's date range for stats
  const todayRange = useMemo(() => {
    const now = getNowInArgentina();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { from: today, to: tomorrow };
  }, []);

  // Filter entries for today only (for stats)
  const todayEntries = useMemo(() => {
    return allEntries.filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= todayRange.from && entryDate < todayRange.to;
    });
  }, [allEntries, todayRange]);

  // Calculate summary for today only
  const summary: SummaryData = useMemo(() => {
    const totalIncome = todayEntries
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = todayEntries
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  }, [todayEntries]);

  // Handlers
  const handleAddEntry = async (newEntry: Entry) => {
    setAllEntries((prev) => [...prev, newEntry]);
    setPaginatedEntries((prev) => [newEntry, ...prev.slice(0, 9)]); // Add to top of current page
    setTotalEntries((prev) => prev + 1);
    setIsModalOpen(false);
    closePopup();
  };

  const handleDeleteEntry = async (id: string) => {
    await dataService.deleteEntry(id);
    setAllEntries((prev) => prev.filter((e) => e.id !== id));
    // Reload current page after deletion
    const { entries, total } = await dataService.getPaginatedEntries({
      page: currentPage,
      limit: 10,
    });
    setPaginatedEntries(entries);
    setTotalEntries(total);
  };

  const handleUpdateEntry = (updatedEntry: Entry) => {
    setAllEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
    setPaginatedEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

        <div className="mb-3">
          <SummaryCards data={summary} dateRange={todayRange} />
        </div>

        <div className="mb-8">
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
