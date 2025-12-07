# Prompeat Database Documentation

This document provides complete documentation for the Prompeat database schema.

## Quick Start

### Running Migrations

To apply all migrations to your Supabase database:

```bash
# If using Supabase CLI locally
supabase db reset

# Or apply migrations one by one
supabase db push
```

### Generating TypeScript Types

After running migrations, generate TypeScript types:

```bash
npx supabase gen types typescript --local > src/shared/types/database.ts
```

---

## Schema Overview

**Total Tables**: 9 (1 extended + 8 new)
- `users` (extended)
- `categories`
- `tags`
- `prompts` ⭐ Core table
- `prompt_versions`
- `prompt_tags` (junction)
- `collections`
- `collection_prompts` (junction)
- `favorites`

**Custom Enums**: 4
- `visibility_type`
- `prompt_status`
- `collection_visibility`
- `variable_type`

---

## Table Details

### 1. users (Extended)

Extended existing Supabase Auth users table with profile and stats.

**New Columns**:
```sql
username          TEXT UNIQUE         -- Unique username (3-30 chars, alphanumeric + _ -)
bio               TEXT                -- User bio
website           TEXT                -- Personal website
total_prompts     INTEGER DEFAULT 0   -- Denormalized count
total_collections INTEGER DEFAULT 0   -- Denormalized count
total_favorites   INTEGER DEFAULT 0   -- Denormalized count
preferences       JSONB               -- User settings/preferences
```

**Key Indexes**:
- `idx_users_username` - Fast username lookups
- `idx_users_created_at` - Sorting by join date
- `idx_users_total_prompts` - Leaderboard queries

**Usage Example**:
```sql
-- Get user profile
SELECT * FROM users WHERE username = 'john-doe';

-- Top prompt creators
SELECT username, total_prompts
FROM users
ORDER BY total_prompts DESC
LIMIT 10;
```

---

### 2. categories

Hierarchical category system for organizing prompts.

**Columns**:
```sql
id           UUID PRIMARY KEY
name         TEXT NOT NULL UNIQUE      -- Display name
slug         TEXT NOT NULL UNIQUE      -- URL-friendly name
description  TEXT                      -- Category description
icon         TEXT                      -- Lucide icon name
parent_id    UUID REFERENCES categories -- For subcategories
order_index  INTEGER DEFAULT 0         -- Custom ordering
is_active    BOOLEAN DEFAULT true      -- Soft delete
created_at   TIMESTAMP
updated_at   TIMESTAMP
```

**Hierarchical Structure**:
```
Creative Writing (parent_id: NULL)
├── Poetry (parent_id: creative-writing-id)
└── Fiction (parent_id: creative-writing-id)
```

**Usage Example**:
```sql
-- Get all main categories
SELECT * FROM categories
WHERE parent_id IS NULL AND is_active = true
ORDER BY order_index;

-- Get subcategories
SELECT * FROM categories
WHERE parent_id = 'parent-category-id'
ORDER BY order_index;
```

**Seed Data**: 6 default categories (Creative Writing, Code Generation, Business, etc.)

---

### 3. tags

Flexible tagging system for cross-cutting organization.

**Columns**:
```sql
id          UUID PRIMARY KEY
name        TEXT NOT NULL UNIQUE
slug        TEXT NOT NULL UNIQUE
usage_count INTEGER DEFAULT 0    -- Auto-updated via trigger
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

**Key Features**:
- `usage_count` automatically updated when prompts are tagged
- Supports fuzzy search via trigram index

**Usage Example**:
```sql
-- Search tags by name (fuzzy)
SELECT * FROM tags
WHERE name % 'pythn'  -- Matches "python"
ORDER BY similarity(name, 'pythn') DESC;

-- Most popular tags
SELECT name, usage_count FROM tags
ORDER BY usage_count DESC
LIMIT 20;
```

**Seed Data**: 20 common tags (ChatGPT, Claude, Marketing, Python, etc.)

---

### 4. prompts ⭐ Core Table

Main table storing all prompts with rich metadata.

**Content Fields**:
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES users NOT NULL
category_id  UUID REFERENCES categories
title        TEXT NOT NULL (3-200 chars)
slug         TEXT NOT NULL (unique per user)
description  TEXT (max 500 chars)
content      TEXT NOT NULL (10-10000 chars)
variables    JSONB DEFAULT '[]'     -- Template variables
```

**State Fields**:
```sql
visibility   visibility_type DEFAULT 'private'
status       prompt_status DEFAULT 'draft'
version      INTEGER DEFAULT 1
parent_prompt_id UUID REFERENCES prompts  -- For forking
```

**Engagement Metrics** (denormalized):
```sql
view_count     INTEGER DEFAULT 0
copy_count     INTEGER DEFAULT 0
fork_count     INTEGER DEFAULT 0
favorite_count INTEGER DEFAULT 0
```

**Search**:
```sql
search_vector tsvector  -- Auto-updated full-text search
```

**Variables Format** (JSONB):
```json
[
  {
    "name": "topic",
    "type": "text",
    "description": "The main topic to write about",
    "required": true,
    "default": ""
  },
  {
    "name": "tone",
    "type": "select",
    "description": "Writing tone",
    "required": false,
    "default": "professional",
    "options": ["professional", "casual", "friendly"]
  }
]
```

**Key Indexes**:
- `idx_prompts_public_published` - Fast public feed queries
- `idx_prompts_user_status` - User dashboard
- `idx_prompts_search_vector` - Full-text search
- `idx_prompts_favorite_count` - Popular prompts

**Usage Examples**:
```sql
-- Get public prompts (homepage feed)
SELECT p.*, u.username, u.avatar_url
FROM prompts p
JOIN users u ON p.user_id = u.id
WHERE p.visibility = 'public' AND p.status = 'published'
ORDER BY p.published_at DESC
LIMIT 20;

-- Full-text search
SELECT * FROM prompts
WHERE search_vector @@ to_tsquery('english', 'marketing & email')
  AND visibility = 'public'
ORDER BY ts_rank(search_vector, to_tsquery('english', 'marketing & email')) DESC;

-- User's prompts
SELECT * FROM prompts
WHERE user_id = 'user-id'
ORDER BY updated_at DESC;

-- Fork a prompt
INSERT INTO prompts (user_id, title, content, parent_prompt_id, ...)
SELECT 'new-user-id', title, content, id, ...
FROM prompts
WHERE id = 'prompt-to-fork-id';
```

**Automatic Features**:
- Search vector auto-updates on content change
- Timestamps auto-update
- Version history auto-created on edit

---

### 5. prompt_versions

Complete version history for prompts (keeps last 10 versions).

**Columns**:
```sql
id             UUID PRIMARY KEY
prompt_id      UUID REFERENCES prompts NOT NULL
user_id        UUID REFERENCES users NOT NULL
version        INTEGER NOT NULL
title          TEXT NOT NULL (snapshot)
content        TEXT NOT NULL (snapshot)
variables      JSONB (snapshot)
change_summary TEXT (optional notes)
created_at     TIMESTAMP
```

**Key Features**:
- Automatically created when prompt content/title/variables change
- Only last 10 versions kept (free tier optimization)
- Complete snapshot (not diffs) for easy restoration

**Usage Examples**:
```sql
-- Get version history
SELECT version, title, change_summary, created_at
FROM prompt_versions
WHERE prompt_id = 'prompt-id'
ORDER BY version DESC;

-- Restore to previous version
UPDATE prompts
SET content = (
  SELECT content FROM prompt_versions
  WHERE prompt_id = 'prompt-id' AND version = 3
)
WHERE id = 'prompt-id';
```

---

### 6. prompt_tags (Junction Table)

Many-to-many relationship between prompts and tags.

**Columns**:
```sql
prompt_id  UUID REFERENCES prompts NOT NULL
tag_id     UUID REFERENCES tags NOT NULL
created_at TIMESTAMP
PRIMARY KEY (prompt_id, tag_id)
```

**Automatic Features**:
- Updates `tags.usage_count` on insert/delete

**Usage Examples**:
```sql
-- Get prompt with tags
SELECT p.*, array_agg(t.name) as tags
FROM prompts p
LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.id = 'prompt-id'
GROUP BY p.id;

-- Add tags to prompt
INSERT INTO prompt_tags (prompt_id, tag_id) VALUES
  ('prompt-id', 'tag-id-1'),
  ('prompt-id', 'tag-id-2');

-- Find prompts by tag
SELECT p.*
FROM prompts p
JOIN prompt_tags pt ON p.id = pt.prompt_id
JOIN tags t ON pt.tag_id = t.id
WHERE t.slug = 'python' AND p.visibility = 'public';
```

---

### 7. collections

User-created folders/collections to organize prompts.

**Columns**:
```sql
id             UUID PRIMARY KEY
user_id        UUID REFERENCES users NOT NULL
name           TEXT NOT NULL
slug           TEXT NOT NULL (unique per user)
description    TEXT
icon           TEXT (Lucide icon)
visibility     collection_visibility DEFAULT 'private'
prompt_count   INTEGER DEFAULT 0  -- Auto-updated
favorite_count INTEGER DEFAULT 0
order_index    INTEGER DEFAULT 0  -- Custom user ordering
created_at     TIMESTAMP
updated_at     TIMESTAMP
```

**Usage Examples**:
```sql
-- User's collections
SELECT * FROM collections
WHERE user_id = 'user-id'
ORDER BY order_index, created_at DESC;

-- Public collections
SELECT c.*, u.username
FROM collections c
JOIN users u ON c.user_id = u.id
WHERE c.visibility = 'public'
ORDER BY c.favorite_count DESC;
```

---

### 8. collection_prompts (Junction Table)

Many-to-many relationship between collections and prompts.

**Columns**:
```sql
collection_id UUID REFERENCES collections NOT NULL
prompt_id     UUID REFERENCES prompts NOT NULL
order_index   INTEGER DEFAULT 0  -- Ordering within collection
added_at      TIMESTAMP
PRIMARY KEY (collection_id, prompt_id)
```

**Automatic Features**:
- Updates `collections.prompt_count` on insert/delete

**Usage Examples**:
```sql
-- Get collection with prompts
SELECT p.*
FROM prompts p
JOIN collection_prompts cp ON p.id = cp.prompt_id
WHERE cp.collection_id = 'collection-id'
ORDER BY cp.order_index;

-- Add prompt to collection
INSERT INTO collection_prompts (collection_id, prompt_id, order_index)
VALUES ('collection-id', 'prompt-id', 1);

-- Reorder prompts in collection
UPDATE collection_prompts
SET order_index = 2
WHERE collection_id = 'collection-id' AND prompt_id = 'prompt-id';
```

---

### 9. favorites

User bookmarks for prompts.

**Columns**:
```sql
id         UUID PRIMARY KEY
user_id    UUID REFERENCES users NOT NULL
prompt_id  UUID REFERENCES prompts NOT NULL
created_at TIMESTAMP
UNIQUE (user_id, prompt_id)
```

**Automatic Features**:
- Updates `prompts.favorite_count` on insert/delete
- Updates `users.total_favorites` on insert/delete

**Usage Examples**:
```sql
-- User's favorites
SELECT p.*
FROM prompts p
JOIN favorites f ON p.id = f.prompt_id
WHERE f.user_id = 'user-id'
ORDER BY f.created_at DESC;

-- Toggle favorite
INSERT INTO favorites (user_id, prompt_id)
VALUES ('user-id', 'prompt-id')
ON CONFLICT (user_id, prompt_id) DO NOTHING;

-- Remove favorite
DELETE FROM favorites
WHERE user_id = 'user-id' AND prompt_id = 'prompt-id';

-- Check if favorited
SELECT EXISTS (
  SELECT 1 FROM favorites
  WHERE user_id = 'user-id' AND prompt_id = 'prompt-id'
) as is_favorited;
```

---

## Custom Enums

### visibility_type
```sql
'public'   -- Visible to everyone
'private'  -- Only visible to owner
'unlisted' -- Visible to anyone with the link
```

### prompt_status
```sql
'draft'     -- Work in progress
'published' -- Live and discoverable
'archived'  -- Soft deleted
```

### collection_visibility
```sql
'public'  -- Anyone can view
'private' -- Only owner can view
```

### variable_type
```sql
'text'        -- Single-line text input
'textarea'    -- Multi-line text input
'number'      -- Numeric input
'select'      -- Dropdown selection
'multiselect' -- Multiple selection
```

---

## Utility Functions

### generate_unique_slug(title, user_id)

Generates a URL-friendly slug from a title, ensuring uniqueness per user.

```sql
SELECT generate_unique_slug('My Awesome Prompt', 'user-id');
-- Returns: 'my-awesome-prompt'
-- If exists, returns: 'my-awesome-prompt-1'
```

### extract_prompt_variables(content)

Extracts `{{variable}}` patterns from prompt content.

```sql
SELECT extract_prompt_variables('Write about {{topic}} in {{tone}} tone');
-- Returns: [{"name": "topic", "type": "text", ...}, {"name": "tone", "type": "text", ...}]
```

---

## Row-Level Security (RLS)

All tables have RLS enabled for security.

### Key Policies

**Prompts**:
- ✅ Anyone can view public, published prompts
- ✅ Users can view their own prompts
- ✅ Users can CRUD their own prompts

**Collections**:
- ✅ Anyone can view public collections
- ✅ Users can view their own collections
- ✅ Users can CRUD their own collections

**Favorites**:
- ✅ Users can only view/manage their own favorites

**Tags & Categories**:
- ✅ Public read-only (everyone can view)

---

## Performance Optimization

### Indexes Strategy

1. **Foreign Keys**: All FK columns indexed for JOIN performance
2. **Filter Columns**: visibility, status, is_active
3. **Sort Columns**: created_at, published_at, usage_count
4. **Search**: GIN indexes on search_vector, JSONB, trigrams
5. **Composite**: Common query patterns (user_id + status + date)
6. **Partial**: Frequent WHERE conditions

### Query Performance Targets

- User dashboard (my prompts): < 50ms
- Public feed (homepage): < 100ms
- Full-text search: < 150ms
- Single prompt fetch: < 10ms
- Collection view: < 30ms

### Caching Recommendations

Using Redis or similar:
- User profiles: 15 min TTL
- Public prompts list: 5 min TTL
- Categories/tags: 24 hour TTL
- Individual prompts: 10 min TTL

---

## Common Query Patterns

### 1. Homepage Feed (Public Prompts)

```sql
SELECT
  p.*,
  u.username,
  u.avatar_url,
  c.name as category_name,
  array_agg(DISTINCT t.name) as tags
FROM prompts p
JOIN users u ON p.user_id = u.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.visibility = 'public' AND p.status = 'published'
GROUP BY p.id, u.id, c.id
ORDER BY p.published_at DESC
LIMIT 20 OFFSET 0;
```

### 2. User Dashboard

```sql
SELECT
  p.*,
  c.name as category_name,
  array_agg(DISTINCT t.name) as tags
FROM prompts p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.user_id = 'user-id'
GROUP BY p.id, c.id
ORDER BY p.updated_at DESC;
```

### 3. Search Prompts

```sql
-- Full-text search
SELECT *, ts_rank(search_vector, query) as rank
FROM prompts,
     to_tsquery('english', 'marketing & email') query
WHERE search_vector @@ query
  AND visibility = 'public'
  AND status = 'published'
ORDER BY rank DESC
LIMIT 50;

-- Filter by category and tags
SELECT DISTINCT p.*
FROM prompts p
JOIN prompt_tags pt ON p.id = pt.prompt_id
JOIN tags t ON pt.tag_id = t.id
WHERE p.category_id = 'category-id'
  AND t.slug IN ('python', 'javascript')
  AND p.visibility = 'public'
ORDER BY p.favorite_count DESC;
```

### 4. Prompt Detail Page

```sql
SELECT
  p.*,
  u.username,
  u.avatar_url,
  c.name as category_name,
  c.slug as category_slug,
  array_agg(DISTINCT jsonb_build_object('name', t.name, 'slug', t.slug)) as tags,
  EXISTS (
    SELECT 1 FROM favorites
    WHERE user_id = 'current-user-id' AND prompt_id = p.id
  ) as is_favorited
FROM prompts p
JOIN users u ON p.user_id = u.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.id = 'prompt-id'
GROUP BY p.id, u.id, c.id;
```

---

## Troubleshooting

### Common Issues

**1. RLS blocking legitimate queries**
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'prompts';

-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-id"}'::json;
```

**2. Slow queries**
```sql
-- Check query plan
EXPLAIN ANALYZE
SELECT * FROM prompts WHERE visibility = 'public';

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE tablename = 'prompts';
```

**3. Trigger not firing**
```sql
-- Check triggers
SELECT * FROM pg_trigger WHERE tgname LIKE '%prompt%';

-- Test function manually
SELECT update_prompt_search_vector();
```

---

## Migration Rollback

To rollback migrations:

```bash
# Rollback last migration
supabase migration revert

# Or manually drop in reverse order
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS collection_prompts CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS prompt_tags CASCADE;
DROP TABLE IF EXISTS prompt_versions CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TYPE IF EXISTS variable_type;
DROP TYPE IF EXISTS collection_visibility;
DROP TYPE IF EXISTS prompt_status;
DROP TYPE IF EXISTS visibility_type;
```

---

## Next Steps

1. ✅ Run migrations: `supabase db push`
2. ✅ Generate types: `npx supabase gen types typescript`
3. ✅ Create domain entities in `src/modules/prompts/domain/entities/`
4. ✅ Implement repositories in `src/modules/prompts/data/repositories/`
5. ✅ Build UI components

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
