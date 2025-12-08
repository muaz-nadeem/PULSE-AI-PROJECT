# Supabase Integration Setup Guide

## Overview
Your frontend has been successfully integrated with Supabase for backend database and authentication. This guide will help you complete the setup.

## Prerequisites
- A Supabase account (create one at https://supabase.com if you don't have one)

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - Name: Choose a name (e.g., "pulse-ai")
   - Database Password: Create a strong password (save this!)
   - Region: Choose the closest region
4. Click "Create new project"
5. Wait for the project to be set up (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, look for the **Settings** icon (gear icon) in the left sidebar
2. Click on **Settings** → **API** (or go directly to: https://app.supabase.com/project/_/settings/api)
3. On the API settings page, you'll see several sections:
   - **Project URL** - This is your project URL (you already have this)
   - **Project API keys** section - Look for the **anon public** key here
4. The **anon public** key will be a long string that starts with `eyJ...` (it's a JWT token)
5. Click the **eye icon** or **copy icon** next to the anon public key to reveal/copy it
6. **Important**: Use the **anon public** key (not the service_role key, which is secret)

**Visual Guide:**
- Left sidebar → Settings (gear icon) → API
- Scroll down to "Project API keys" section
- Find the row labeled "anon public" 
- Click the copy icon or eye icon to copy/reveal the key

## Step 3: Set Up Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Open `.env.local` and replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Run the Database Migration

You have two options:

### Option A: Using Supabase SQL Editor (Recommended for beginners)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file `supabase/migrations/001_initial_schema.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. Wait for the migration to complete

### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Push the migration:
   ```bash
   supabase db push
   ```

## Step 5: Disable Email Confirmation (Important!)

**You must disable email confirmation for users to sign up immediately:**

1. In your Supabase dashboard, go to **Authentication** → **Settings** (or **Authentication** → **Providers** → **Email**)
2. Scroll down to **Email Auth** section
3. Find **"Enable email confirmations"** toggle
4. **Turn it OFF** (disable it)
5. Save the changes

This allows users to sign up and immediately log in without needing to confirm their email.

## Step 6: Verify the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000
3. Try signing up with a new account
4. You should be immediately logged in after signup (no email confirmation needed)
5. Check your Supabase dashboard → **Authentication** → **Users** to see if the user was created
6. Check **Table Editor** to see if data tables were created

## Step 7: Test the Application

1. **Sign Up**: Create a new account (should log you in immediately)
2. **Login**: Log in with your credentials
3. **Create Tasks**: Add some tasks and verify they appear in Supabase
4. **Check RLS**: Try accessing data from another user's account (should be blocked)

## Database Schema

The following tables have been created:

- `users` - User profiles
- `tasks` - User tasks
- `focus_sessions` - Focus session tracking
- `distractions` - Distraction logging
- `habits` - Habit tracking
- `goals` - Goal management
- `milestones` - Goal milestones
- `mood_entries` - Mood tracking
- `time_blocks` - Calendar time blocks
- `challenges` - Personal challenges
- `achievements` - Achievement definitions
- `user_achievements` - User achievement unlocks
- `notifications` - User notifications
- `user_settings` - User preferences
- `blocking_settings` - App blocking settings
- `team_members` - Team collaboration
- `shared_goals` - Shared goals
- `group_challenges` - Group challenges
- `group_challenge_participants` - Challenge participants
- `playlists` - Focus sound playlists

## Row Level Security (RLS)

All tables have RLS enabled, ensuring:
- Users can only access their own data
- Data is automatically filtered by `user_id`
- Secure by default

## Troubleshooting

### Build Errors
- Make sure `.env.local` exists and has valid Supabase credentials
- Check that environment variable names match exactly (case-sensitive)

### Authentication Issues
- Verify your Supabase project is active
- **Make sure email confirmation is DISABLED** (Settings → Authentication → Email Auth → Disable "Enable email confirmations")
- If you see "invalid email" errors, the email might already be registered - check Authentication → Users

### Database Errors
- Ensure the migration ran successfully
- Check Supabase logs (Dashboard → Logs)
- Verify RLS policies are active (Table Editor → Select table → RLS tab)

### Connection Issues
- Verify your Supabase URL and key are correct
- Check your internet connection
- Ensure your Supabase project is not paused

## Next Steps

1. **Customize Authentication**: Configure email templates, OAuth providers, etc. in Supabase dashboard
2. **Add Real-time**: Enable real-time subscriptions for live updates
3. **Set Up Backups**: Configure automatic backups in Supabase
4. **Monitor Usage**: Check your Supabase dashboard for usage metrics

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Next.js + Supabase: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

