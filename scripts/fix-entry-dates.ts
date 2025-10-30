/**
 * Script to fix entry dates that were saved with timezone issues
 *
 * This script will:
 * 1. Fetch all entries from the database
 * 2. Check if the date field needs adjustment
 * 3. Update entries to ensure dates are properly stored in UTC
 *
 * Run this script once after deploying the timezone fixes
 */

import { createClient } from "@supabase/supabase-js";

// You need to set these environment variables or replace with your actual values
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function fixEntryDates() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing Supabase credentials");
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log("🔍 Fetching all entries...");

  // Fetch all entries
  const { data: entries, error: fetchError } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("❌ Error fetching entries:", fetchError);
    process.exit(1);
  }

  if (!entries || entries.length === 0) {
    console.log("✅ No entries found to fix");
    return;
  }

  console.log(`📊 Found ${entries.length} entries`);

  let fixedCount = 0;
  let errorCount = 0;

  for (const entry of entries) {
    try {
      // Parse the current date
      const currentDate = new Date(entry.date);

      // Check if the date needs fixing
      // If dates were stored with timezone offset issues, we need to adjust them
      // This assumes dates were incorrectly stored without proper timezone handling

      // Get the date components as if they were in Argentina timezone
      const argFormatter = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "America/Argentina/Buenos_Aires",
      });

      const parts = argFormatter.formatToParts(currentDate);
      const values: Record<string, string> = {};

      parts.forEach((part) => {
        if (part.type !== "literal") {
          values[part.type] = part.value;
        }
      });

      // Create a UTC date string with Argentina timezone components
      const utcDateString = `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}Z`;
      const correctedDate = new Date(utcDateString);

      // Only update if there's a difference (more than 1 minute to account for rounding)
      const timeDiff = Math.abs(correctedDate.getTime() - currentDate.getTime());

      if (timeDiff > 60000) { // More than 1 minute difference
        const { error: updateError } = await supabase
          .from("entries")
          .update({ date: correctedDate.toISOString() })
          .eq("id", entry.id);

        if (updateError) {
          console.error(`❌ Error updating entry ${entry.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`✅ Fixed entry ${entry.id}: ${entry.date} → ${correctedDate.toISOString()}`);
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing entry ${entry.id}:`, error);
      errorCount++;
    }
  }

  console.log("\n📈 Summary:");
  console.log(`   Total entries: ${entries.length}`);
  console.log(`   Fixed: ${fixedCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Unchanged: ${entries.length - fixedCount - errorCount}`);
  console.log("\n✅ Script completed");
}

// Run the script
fixEntryDates().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
