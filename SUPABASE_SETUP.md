# Supabase Setup Instructions

## Summary of Changes

I've successfully integrated Supabase authentication and database into your Verdu App. Here's what was implemented:

### 1. **Dependencies Installed** ✅
- `@supabase/supabase-js` - Main Supabase client
- `@supabase/ssr` - Server-side rendering support

### 2. **Files Created/Modified** ✅

**New Files:**
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client
- `lib/auth-actions.ts` - Server actions for sign in/out
- `app/(protected)/layout.tsx` - Protected route layout with auth check
- `supabase-schema.sql` - Database schema

**Modified Files:**
- `app/login/page.tsx` - Full login form with pixel-retroui
- `lib/data-service.ts` - Now uses Supabase instead of localStorage
- `lib/types.ts` - Added `created_by` and `created_at` fields to Entry
- `components/ui/nav-bar.tsx` - Added sign out button
- `app/layout.tsx` - Updated metadata

**Moved Files:**
- `app/page.tsx` → `app/(protected)/page.tsx`
- `app/reports/page.tsx` → `app/(protected)/reports/page.tsx`

### 3. **How It Works**

**Authentication Flow:**
1. All routes under `app/(protected)/` require authentication
2. Unauthenticated users are redirected to `/login`
3. Login page accepts username/email and password
4. After login, users are redirected to dashboard
5. NavBar has a "Salir" (Sign Out) button

**Data Flow:**
- All entries are stored in Supabase PostgreSQL
- Each entry has a `created_by` field linking to the user
- All authenticated users can view/create/delete all entries (no per-user isolation)

---

## Steps to Complete Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose organization and set:
   - **Name:** verdu-app (or your preference)
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is perfect for this app

### Step 2: Get Your Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 3: Create Environment File

Create a file named `.env.local` in the root of your project:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Replace `your-project-url-here` and `your-anon-key-here` with your actual values from Step 2.

### Step 4: Run Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

This creates:
- `entries` table with all fields
- Row Level Security policies
- Indexes for performance

### Step 5: Create Users Manually

1. In Supabase, go to **Authentication** → **Users** (left sidebar)
2. Click "Add user" → "Create new user"
3. For each user, enter:

**User 1:**
- Email: `jota@verduapp.com` (or any email format you prefer)
- Password: `JotaVerdu@123`
- Auto Confirm User: ✅ (check this)

**User 2:**
- Email: `manu@verduapp.com`
- Password: `ManuVerdu@123`
- Auto Confirm User: ✅

**User 3:**
- Email: `kimi@verduapp.com`
- Password: `KimiVerdu@123`
- Auto Confirm User: ✅

**Note:** For the login form, users will enter their **email** as the username.

### Step 6: Test the App

1. Make sure your `.env.local` file is created and has the correct values
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:3000`
4. You should be redirected to `/login`
5. Try logging in with:
   - Username: `jota@verduapp.com`
   - Password: `JotaVerdu@123`
6. After successful login, you should see the dashboard
7. Try creating a new entry - it should save to Supabase
8. Check the NavBar and try the "Salir" button to sign out

---

## Verification Checklist

- [ ] Supabase project created
- [ ] `.env.local` file created with correct credentials
- [ ] Database schema executed successfully
- [ ] Three users created in Supabase Auth
- [ ] Development server restarted
- [ ] Can access login page
- [ ] Can log in with test credentials
- [ ] Redirected to dashboard after login
- [ ] Can create new entries
- [ ] Can delete entries
- [ ] Can navigate to Reports page
- [ ] Can sign out and are redirected to login

---

## Database Schema Reference

```sql
create table entries (
  id uuid default gen_random_uuid() primary key,
  type text check (type in ('income', 'expense')) not null,
  amount numeric not null,
  date timestamptz not null,
  description text,
  method text check (method in ('cash', 'debit_card', 'credit_card', 'transfer', 'other')) not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);
```

---

## Troubleshooting

### Login not working?
- Check that `.env.local` exists and has correct values
- Verify the email exists in Supabase Auth → Users
- Make sure "Auto Confirm User" was checked when creating users
- Check browser console for errors

### Entries not loading?
- Verify database schema was executed successfully
- Check Supabase → Table Editor → entries table exists
- Open browser console and look for errors
- Check Network tab for failed API calls

### "User not authenticated" error?
- Clear browser cookies and local storage
- Try logging out and back in
- Check that Supabase session is valid in Application → Cookies

### Need to add more users?
- Go to Authentication → Users → Add user
- Enter email and password
- Check "Auto Confirm User"
- Click "Create user"

---

## Next Steps (Optional)

Once everything is working, you might want to:

1. **Customize email domains:**
   - Update user emails to be simpler (e.g., just "jota", "manu", "kimi")
   - Modify login form to append domain automatically

2. **Add user names to entries:**
   - Display which user created each entry
   - Requires fetching user metadata from Supabase

3. **Add date filters:**
   - Use the `getEntriesByDateRange` method for better performance

4. **Deploy to production:**
   - Add environment variables to your hosting platform
   - Consider upgrading Supabase plan if needed

---

## Support

If you encounter any issues during setup, check:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
