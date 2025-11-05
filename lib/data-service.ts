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

  /**
   * Get paginated entries with total count
   */
  async getPaginatedEntries(params: {
    page: number;
    limit: number;
    searchTerm?: string;
    createdBy?: string;
    fromDate?: string;
    toDate?: string;
    paymentMethod?: string;
    entryType?: "income" | "expense";
  }): Promise<{ entries: Entry[]; total: number }> {
    const supabase = createClient();
    const { page, limit, searchTerm, createdBy, fromDate, toDate, paymentMethod, entryType } = params;
    const offset = (page - 1) * limit;

    // Build count query with filters
    let countQuery = supabase.from("entries").select("*", { count: "exact", head: true });

    // Apply filters to count query
    if (createdBy) {
      countQuery = countQuery.eq("created_by", createdBy);
    }
    if (fromDate) {
      countQuery = countQuery.gte("date", new Date(`${fromDate}T00:00:00`).toISOString());
    }
    if (toDate) {
      const toDateEnd = new Date(`${toDate}T23:59:59`).toISOString();
      countQuery = countQuery.lte("date", toDateEnd);
    }
    if (paymentMethod) {
      countQuery = countQuery.eq("method", paymentMethod);
    }
    if (entryType) {
      countQuery = countQuery.eq("type", entryType);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("Error counting entries:", countError);
      throw countError;
    }

    // For filtered queries, try to use the RPC function if no filters, otherwise use direct query
    let data;
    let error;

    // If we have filters, we need to use direct query
    if (createdBy || fromDate || toDate || paymentMethod || entryType) {
      // Build query with left join to users table
      let dataQuery = supabase
        .from("entries")
        .select("*")
        .order("date", { ascending: false });

      // Apply filters
      if (createdBy) {
        dataQuery = dataQuery.eq("created_by", createdBy);
      }
      if (fromDate) {
        dataQuery = dataQuery.gte("date", new Date(`${fromDate}T00:00:00`).toISOString());
      }
      if (toDate) {
        const toDateEnd = new Date(`${toDate}T23:59:59`).toISOString();
        dataQuery = dataQuery.lte("date", toDateEnd);
      }
      if (paymentMethod) {
        dataQuery = dataQuery.eq("method", paymentMethod);
      }
      if (entryType) {
        dataQuery = dataQuery.eq("type", entryType);
      }

      // Apply pagination
      dataQuery = dataQuery.range(offset, offset + limit - 1);

      const result = await dataQuery;
      data = result.data;
      error = result.error;

      // If we got data, try to fetch user emails separately
      if (data && data.length > 0) {
        try {
          const userIds = [...new Set(data.map((e: any) => e.created_by))];

          // Try to get user emails via RPC instead of direct query
          const { data: allEntriesWithUsers } = await supabase.rpc("get_entries_with_users");

          if (allEntriesWithUsers) {
            const userMap = new Map();
            allEntriesWithUsers.forEach((e: any) => {
              if (e.created_by && e.user_email) {
                userMap.set(e.created_by, e.user_email);
              }
            });

            // Add user emails to entries
            data = data.map((e: any) => ({
              ...e,
              user_email: userMap.get(e.created_by) || undefined,
            }));
          } else {
            // If RPC fails, just add undefined user_email
            data = data.map((e: any) => ({
              ...e,
              user_email: undefined,
            }));
          }
        } catch (userError) {
          console.warn("Error fetching user emails:", userError);
          // Continue without user emails if there's an error
          data = data.map((e: any) => ({
            ...e,
            user_email: undefined,
          }));
        }
      }
    } else {
      // No filters, use RPC function
      const result = await supabase
        .rpc("get_entries_with_users")
        .order("date", { ascending: false })
        .range(offset, offset + limit - 1);

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Error fetching paginated entries:", error);
      throw error;
    }

    // Convert date strings to Date objects
    const entries = (data || []).map((e: any) => ({
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

    return {
      entries,
      total: count || 0,
    };
  },

  /**
   * Get unique users who have created entries
   */
  async getEntryCreators(): Promise<Array<{ id: string; email: string }>> {
    const supabase = createClient();

    try {
      // Try to get all entries with user info using RPC
      const { data, error } = await supabase.rpc("get_entries_with_users");

      if (error) {
        console.warn("Error fetching entries with users via RPC:", error);
        // Fallback: return empty array if RPC fails
        return [];
      }

      // Get unique users from the entries
      const uniqueUsers = new Map<string, string>();
      (data || []).forEach((entry: any) => {
        if (entry.created_by && entry.user_email) {
          uniqueUsers.set(entry.created_by, entry.user_email);
        }
      });

      return Array.from(uniqueUsers.entries()).map(([id, email]) => ({ id, email }));
    } catch (err) {
      console.warn("Error in getEntryCreators:", err);
      // Return empty array on error - filters will just not show user filter
      return [];
    }
  },
};
