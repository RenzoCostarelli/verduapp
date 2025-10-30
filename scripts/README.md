# Scripts

## Fix Entry Dates

This script helps fix entries that may have been saved with incorrect timezone information.

### The Problem

Before the timezone fixes, dates might have been stored incorrectly in the database. This script helps identify and fix those entries.

### How to Use

1. **Set up environment variables**

   Create a `.env.local` file in the root of your project (if you don't have one) and add:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

   You can find the service role key in your Supabase Dashboard:
   - Go to Settings → API
   - Copy the `service_role` key (not the `anon` key)

2. **Install dependencies** (if not already installed)

   ```bash
   npm install
   ```

3. **Run the inspection script**

   First, run the script to see what would be changed:

   ```bash
   node scripts/fix-entry-dates.js
   ```

   This will show you all entries and their current dates without making changes.

4. **Review the output**

   Check if the dates shown need fixing. If they look wrong, proceed to update them.

5. **Enable updates** (if needed)

   If you need to fix the dates:
   - Open `scripts/fix-entry-dates.js`
   - Find the commented update code (around line 72)
   - Uncomment the update block
   - Run the script again

### Alternative: Direct SQL Update

If you prefer to fix dates directly in Supabase, you can run SQL:

```sql
-- Check current dates
SELECT id, date, created_at,
  date AT TIME ZONE 'America/Argentina/Buenos_Aires' as arg_time
FROM entries
ORDER BY created_at DESC
LIMIT 10;

-- If dates need fixing, you can update them
-- (adjust the logic based on your specific case)
UPDATE entries
SET date = date AT TIME ZONE 'UTC'
WHERE date < NOW(); -- Add appropriate WHERE clause
```

### What Changed

The timezone fixes include:

1. **formatDate()** - Now properly displays dates in Argentina timezone (UTC-3)
2. **getNowInArgentina()** - Simplified to use UTC (database standard)
3. **Database ordering** - Changed to use `created_at` instead of `date`

### After Running the Script

1. Clear your browser cache
2. Refresh the application
3. Verify that dates are displaying correctly with proper AM/PM indicators
4. New entries will be saved correctly going forward
