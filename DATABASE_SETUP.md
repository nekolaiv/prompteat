# Database Setup Guide - Prompeat

This guide will help you set up the Prompeat database with all migrations.

## Prerequisites

- [Supabase account](https://supabase.com) (free tier is fine)
- Project already has Supabase client configured in `.env.local`

## Step 1: Set Up Supabase Project

If you haven't already:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to finish setting up (~2 minutes)
4. Copy your project URL and anon key

## Step 2: Configure Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Run Migrations

You have two options:

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Create a new query
4. Copy and paste the content of each migration file **in this exact order**:

```
000_initial_users.sql       ← START HERE (creates users table)
001_extend_users.sql        ← Adds more columns to users
002_create_enums.sql
003_create_categories_tags.sql
004_create_prompts.sql
005_create_prompt_versions.sql
006_create_prompt_tags.sql
007_create_collections.sql
008_create_favorites.sql
009_create_functions.sql
010_seed_data.sql
```

5. Run each migration by clicking **Run** button
6. Verify no errors in the output

### Option B: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
npx supabase init

# Link to your project
npx supabase link --project-ref your-project-ref

# Push all migrations
npx supabase db push
```

## Step 4: Verify Setup

After running migrations, verify tables were created:

1. Go to **Database** → **Tables** in Supabase dashboard
2. You should see these tables:
   - ✅ users (modified)
   - ✅ categories (6 rows)
   - ✅ tags (20 rows)
   - ✅ prompts
   - ✅ prompt_versions
   - ✅ prompt_tags
   - ✅ collections
   - ✅ collection_prompts
   - ✅ favorites

3. Check seed data:
   ```sql
   SELECT * FROM categories;  -- Should have 6 rows
   SELECT * FROM tags;        -- Should have 20 rows
   ```

## Step 5: Generate TypeScript Types

Generate TypeScript types from your database schema:

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Generate types
npx supabase gen types typescript --project-id your-project-ref > src/shared/types/database.ts
```

Or manually from the dashboard:
1. Go to **Settings** → **API**
2. Scroll to **API Settings**
3. Copy the generated TypeScript types
4. Save to `src/shared/types/database.ts`

## Step 6: Test the Database

Test basic operations in SQL Editor:

```sql
-- Test users table extension
SELECT username, total_prompts, total_collections
FROM users
LIMIT 5;

-- Test categories
SELECT name, slug FROM categories WHERE is_active = true;

-- Test tags
SELECT name, usage_count FROM tags ORDER BY usage_count DESC;

-- Test RLS (should return empty if not authenticated)
SELECT * FROM prompts WHERE visibility = 'public';
```

## Step 7: Create Your First Prompt (Optional)

You can test by creating a prompt in SQL Editor:

```sql
-- First, you need a user. Get your user ID:
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Create a test prompt (replace USER_ID)
INSERT INTO prompts (
  user_id,
  category_id,
  title,
  slug,
  description,
  content,
  visibility,
  status,
  published_at
) VALUES (
  'YOUR_USER_ID',
  (SELECT id FROM categories WHERE slug = 'creative-writing'),
  'Test Prompt',
  'test-prompt',
  'A test prompt for testing',
  'Write a story about {{topic}}',
  'public',
  'published',
  now()
);

-- Verify it was created
SELECT title, slug, visibility, status FROM prompts;
```

## Troubleshooting

### Error: "relation already exists"

Some migration already ran. You can either:
- Skip that migration and continue
- Reset the database (WARNING: deletes all data):
  ```sql
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL ON SCHEMA public TO public;
  ```

### Error: "permission denied"

RLS policies are working correctly! This means:
- You're not authenticated when querying
- Or you're trying to access data you don't own

Test with authenticated context:
```sql
-- Set user context
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claim.sub = 'your-user-id';

-- Now try your query
SELECT * FROM prompts WHERE user_id = 'your-user-id';
```

### Error: "extension pg_trgm does not exist"

Enable the extension:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Migration failed partway through

Rollback using the ROLLBACK command, then fix the issue and re-run the migration.

## What's Next?

Now that your database is set up:

1. ✅ Read [DATABASE.md](docs/DATABASE.md) for complete schema documentation
2. ✅ Check [ARCHITECTURE.md](ARCHITECTURE.md) for project structure
3. ✅ Start building the prompts module:
   - Domain entities
   - Data repositories
   - Use cases
   - UI components

## Database Schema Summary

**Tables**: 9
- users (extended with username, bio, stats)
- categories (6 default categories)
- tags (20 common tags)
- prompts (core table with versioning, search, RLS)
- prompt_versions (automatic version history)
- prompt_tags (many-to-many)
- collections (user-created folders)
- collection_prompts (many-to-many)
- favorites (user bookmarks)

**Key Features**:
- ✅ Full-text search on prompts
- ✅ Automatic versioning (keeps last 10)
- ✅ Row-level security on all tables
- ✅ Denormalized counters for performance
- ✅ JSONB for flexible template variables
- ✅ Optimized for Supabase free tier (500MB)

**Storage Estimate**: ~50MB for 10K prompts with 10 versions each

## Support

If you encounter issues:
1. Check [DATABASE.md](docs/DATABASE.md) troubleshooting section
2. Review Supabase logs in dashboard
3. Check PostgreSQL error messages carefully

Happy coding! 🚀
