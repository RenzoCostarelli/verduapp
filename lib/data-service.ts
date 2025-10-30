import type { Entry, DateRange } from "./types";
import { createClient } from "@/lib/supabase/client";

// --- Core Service using Supabase ---
export const dataService = {
  /**
   * Get all entries from Supabase
   */
  async getEntries(): Promise<Entry[]> {
    const supabase = createClient();

    // Use RPC function to get entries with user emails
    const { data, error } = await supabase.rpc("get_entries_with_users");

    if (error) {
      console.error("Error fetching entries:", error);
      throw error;
    }

    // Convert date strings to Date objects
    return (data || []).map((e: {
      id: string;
      type: string;
      amount: number;
      date: string;
      description: string | null;
      method: string;
      created_by: string;
      created_at: string | null;
      user_email: string | null;
    }) => ({
      id: e.id,
      type: e.type as Entry["type"],
      amount: e.amount,
      date: new Date(e.date),
      description: e.description || undefined,
      method: e.method as Entry["method"],
      created_by: e.created_by,
      created_at: e.created_at ? new Date(e.created_at) : undefined,
      user_email: e.user_email || undefined,
    }));
  },

  /**
   * Add new entry to Supabase
   */
  async addEntry(entry: Omit<Entry, "id" | "created_by" | "created_at" | "user_email">): Promise<Entry> {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("entries")
      .insert({
        ...entry,
        created_by: user.id,
        date: entry.date.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding entry:", error);
      throw error;
    }

    return {
      ...data,
      date: new Date(data.date),
      created_at: data.created_at ? new Date(data.created_at) : undefined,
      user_email: user.email || undefined,
    };
  },

  /**
   * Delete entry by id from Supabase
   */
  async deleteEntry(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.from("entries").delete().eq("id", id);

    if (error) {
      console.error("Error deleting entry:", error);
      throw error;
    }
  },

  /**
   * Update entry description by id
   */
  async updateEntryDescription(id: string, description: string | undefined): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("entries")
      .update({ description: description || null })
      .eq("id", id);

    if (error) {
      console.error("Error updating entry description:", error);
      throw error;
    }
  },

  /**
   * Filter entries by date range
   */
  async getEntriesByDateRange(range: DateRange): Promise<Entry[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .gte("date", range.from.toISOString())
      .lte("date", range.to.toISOString())
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching entries by date range:", error);
      throw error;
    }

    return (data || []).map((e) => ({
      ...e,
      date: new Date(e.date),
      created_at: e.created_at ? new Date(e.created_at) : undefined,
    }));
  },
};
