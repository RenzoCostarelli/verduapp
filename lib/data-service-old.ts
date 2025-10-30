import type { Entry, DateRange } from "./types";

// Generate unique ID using crypto.randomUUID
const generateId = (): string => {
  if (typeof window !== "undefined" && window.crypto) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const STORAGE_KEY = "greengrocery.entries";

// Abstract data service for easy swapping to API later
export const dataService = {
  // Get all entries
  async getEntries(): Promise<Entry[]> {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = JSON.parse(data) as Array<any>;
    return entries.map((e) => ({
      ...e,
      date: new Date(e.date),
    }));
  },

  async getEntriesFromSheet(): Promise<Entry[]> {
    const res = await fetch("/api/entries", { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    // Ensure we convert dates back to Date
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json.entries as any[]).map((e) => ({
      ...e,
      date: new Date(e.date),
    }));
  },

  // Add new entry
  async addEntry(entry: Omit<Entry, "id">): Promise<Entry> {
    const entries = await this.getEntries();
    const newEntry: Entry = {
      ...entry,
      id: generateId(),
    };
    entries.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
  },

  // Delete entry
  async deleteEntry(id: string): Promise<void> {
    const entries = await this.getEntries();
    const filtered = entries.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  // Get entries for date range
  async getEntriesByDateRange(range: DateRange): Promise<Entry[]> {
    const entries = await this.getEntries();
    return entries.filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= range.from && entryDate <= range.to;
    });
  },

  // Seed initial data if empty
  async seedIfEmpty(): Promise<void> {
    const entries = await this.getEntries();
    if (entries.length > 0) return;

    const now = new Date();
    const seedData: Entry[] = [
      {
        id: generateId(),
        type: "income",
        amount: 5000,
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        description: "Ventas del día",
        method: "cash",
      },
      {
        id: generateId(),
        type: "expense",
        amount: 1200,
        date: new Date(now.getFullYear(), now.getMonth(), 2),
        description: "Compra de verduras",
        method: "transfer",
      },
      {
        id: generateId(),
        type: "income",
        amount: 3500,
        date: new Date(now.getFullYear(), now.getMonth(), 5),
        description: "Ventas del día",
        method: "debit_card",
      },
      {
        id: generateId(),
        type: "expense",
        amount: 800,
        date: new Date(now.getFullYear(), now.getMonth(), 7),
        description: "Alquiler del local",
        method: "transfer",
      },
      {
        id: generateId(),
        type: "income",
        amount: 4200,
        date: new Date(now.getFullYear(), now.getMonth(), 10),
        description: "Ventas del día",
        method: "cash",
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  },
};
