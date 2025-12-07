# Database Migrations

This directory contains all database migration files for Prompeat.

## Migration Order

**IMPORTANT**: Run migrations in this exact order:

1. `000_initial_users.sql` - Creates base users table (extends Supabase auth)
2. `001_extend_users.sql` - Adds profile fields to users
3. `002_create_enums.sql` - Creates custom enum types
4. `003_create_categories_tags.sql` - Creates categories & tags with seed data
5. `004_create_prompts.sql` - Creates prompts table (core)
6. `005_create_prompt_versions.sql` - Creates version history
7. `006_create_prompt_tags.sql` - Creates prompt-tag relationships
8. `007_create_collections.sql` - Creates collections & organization
9. `008_create_favorites.sql` - Creates favorites/bookmarks
10. `009_create_functions.sql` - Creates utility functions
11. `010_seed_data.sql` - Adds additional seed data

## Quick Start

### Option 1: Supabase Dashboard (Recommended)

1. Open your Supabase project
2. Go to **SQL Editor**
3. For each file above (in order):
   - Open the file
   - Copy all contents
   - Paste into SQL Editor
   - Click **Run**
   - Verify success (no errors)

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# From project root
npx supabase db push
```

This will automatically run all migrations in order.

### Option 3: All-in-One Script

Copy all migration files into one query in this order and run together:

```sql
-- 000_initial_users.sql
-- (paste contents here)

-- 001_extend_users.sql
-- (paste contents here)

-- ... continue for all files
```

## Verification

After running all migrations, verify in Supabase dashboard:

### Check Tables

Go to **Database** → **Tables**. You should see:
- ✅ users (with extended columns)
- ✅ categories (6 rows)
- ✅ tags (20 rows)
- ✅ prompts
- ✅ prompt_versions
- ✅ prompt_tags
- ✅ collections
- ✅ collection_prompts
- ✅ favorites

### Check Seed Data

```sql
-- Should return 6 categories
SELECT COUNT(*) FROM categories;

-- Should return 20+ tags
SELECT COUNT(*) FROM tags;

-- Check categories
SELECT name, slug FROM categories ORDER BY order_index;
```

### Check Functions

```sql
-- Should list all functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

Expected functions:
- `handle_new_user()`
- `handle_updated_at()`
- `handle_prompt_version()`
- `update_prompt_search_vector()`
- `update_tag_usage_count()`
- `update_user_stats()`
- `update_favorite_count()`
- `update_collection_prompt_count()`
- `update_user_collection_count()`
- `generate_unique_slug()`
- `extract_prompt_variables()`

### Check RLS Policies

```sql
-- Should list all RLS policies
SELECT tablename, policyname FROM pg_policies
ORDER BY tablename, policyname;
```

## Rollback

To rollback (WARNING: Deletes all data):

```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS collection_prompts CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS prompt_tags CASCADE;
DROP TABLE IF EXISTS prompt_versions CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop enums
DROP TYPE IF EXISTS variable_type;
DROP TYPE IF EXISTS collection_visibility;
DROP TYPE IF EXISTS prompt_status;
DROP TYPE IF EXISTS visibility_type;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_updated_at();
DROP FUNCTION IF EXISTS handle_prompt_version();
DROP FUNCTION IF EXISTS update_prompt_search_vector();
DROP FUNCTION IF EXISTS update_tag_usage_count();
DROP FUNCTION IF EXISTS update_user_stats();
DROP FUNCTION IF EXISTS update_favorite_count();
DROP FUNCTION IF EXISTS update_collection_prompt_count();
DROP FUNCTION IF EXISTS update_user_collection_count();
DROP FUNCTION IF EXISTS generate_unique_slug();
DROP FUNCTION IF EXISTS extract_prompt_variables();
```

## Troubleshooting

### "relation already exists"
- Migration already ran successfully
- Skip to next migration

### "type already exists"
- Enum already created
- Skip to next migration

### "permission denied"
- RLS policies are working (this is normal)
- Queries need proper authentication context

### "function does not exist"
- Previous migration didn't run
- Go back and run missing migrations

## Next Steps

After successful migration:

1. ✅ Generate TypeScript types:
   ```bash
   npx supabase gen types typescript --project-id your-id > src/shared/types/database.ts
   ```

2. ✅ Test with a query:
   ```sql
   SELECT * FROM categories;
   ```

3. ✅ Create your first prompt via the application

## File Descriptions

- **000**: Initial users table (base schema from Supabase auth integration)
- **001**: User profile extensions (username, bio, stats, etc.)
- **002**: Custom enum types (visibility, status, etc.)
- **003**: Categories and tags (with 6 categories, 20 tags)
- **004**: Prompts table (core table with full-text search, versioning)
- **005**: Version history (automatic snapshots, keeps last 10)
- **006**: Prompt-tag relationships (many-to-many with counter triggers)
- **007**: Collections (folders, organization, many-to-many with prompts)
- **008**: Favorites (bookmarks with counter triggers)
- **009**: Utility functions (slug generation, variable extraction)
- **010**: Additional seed data (more tags, optional sample prompts)

## Database Schema Summary

**Total Tables**: 9
- 1 extended (users)
- 8 new tables

**Total Enums**: 4
**Total Functions**: 11
**Total Triggers**: 8
**Total RLS Policies**: ~20

**Storage Estimate**: ~50MB for 10K prompts with 10 versions each
**Free Tier Compatible**: ✅ Yes (500MB limit)
