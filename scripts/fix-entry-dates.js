/**
 * Script to fix entry dates that were saved with timezone issues
 *
 * Run with: node scripts/fix-entry-dates.js
 *
 * Make sure to set environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function fixEntryDates() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing Supabase credentials");
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log("🔍 Fetching all entries...");

  const { data: entries, error: fetchError } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("❌ Error fetching entries:", fetchError);
    process.exit(1);
  }

  if (!entries || entries.length === 0) {
    console.log("✅ No entries found");
    return;
  }

  console.log(`📊 Found ${entries.length} entries`);
  console.log("\n⚠️  This script will adjust dates assuming they were saved in local timezone");
  console.log("    and need to be converted to proper UTC timestamps.\n");

  let fixedCount = 0;
  let unchangedCount = 0;

  for (const entry of entries) {
    try {
      const currentDate = new Date(entry.date);

      // Check if date looks like it needs fixing
      // If your dates are 3 hours off (Argentina is UTC-3), this will detect it
      const argOffset = -3 * 60; // Argentina is UTC-3
      const currentOffset = currentDate.getTimezoneOffset();

      // If the stored time appears to be in local timezone instead of UTC,
      // we need to adjust it
      // For now, we'll just log what we find

      console.log(`Entry ${entry.id}:`);
      console.log(`  Current: ${entry.date}`);
      console.log(`  Parsed:  ${currentDate.toISOString()}`);
      console.log(`  Display: ${currentDate.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`);

      // You can uncomment this to actually update:
      /*
      const { error: updateError } = await supabase
        .from("entries")
        .update({ date: correctedDate.toISOString() })
        .eq("id", entry.id);

      if (updateError) {
        console.error(`❌ Error updating entry ${entry.id}:`, updateError);
      } else {
        fixedCount++;
        console.log(`✅ Fixed entry ${entry.id}`);
      }
      */

      unchangedCount++;

    } catch (error) {
      console.error(`❌ Error processing entry ${entry.id}:`, error);
    }
  }

  console.log("\n📈 Summary:");
  console.log(`   Total entries reviewed: ${entries.length}`);
  console.log(`   Fixed: ${fixedCount}`);
  console.log(`   Unchanged: ${unchangedCount}`);
  console.log("\n💡 Review the output above to determine if dates need fixing");
  console.log("   If they do, uncomment the update code in this script");
}

fixEntryDates().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
