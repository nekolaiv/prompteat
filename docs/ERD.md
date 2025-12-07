# Prompeat Database ERD (Entity Relationship Diagram)

## Visual Schema

```
┌─────────────────────┐
│       users         │
│─────────────────────│
│ id (PK)             │◀──────────┐
│ email               │           │
│ username (UNIQUE)   │           │
│ name                │           │
│ avatar_url          │           │
│ bio                 │           │
│ website             │           │
│ total_prompts       │           │
│ total_collections   │           │ user_id (FK)
│ total_favorites     │           │
│ preferences (JSONB) │           │
│ created_at          │           │
│ updated_at          │           │
└─────────────────────┘           │
                                  │
                                  │
┌─────────────────────┐           │          ┌──────────────────────┐
│     categories      │           │          │       prompts        │
│─────────────────────│           │          │──────────────────────│
│ id (PK)             │◀──────────┼──────────│ id (PK)              │
│ name (UNIQUE)       │           │          │ user_id (FK)         │──────┐
│ slug (UNIQUE)       │           │          │ category_id (FK)     │      │
│ description         │           │          │ title                │      │
│ icon                │           │          │ slug                 │      │
│ parent_id (FK) ─────┼──┐        │          │ description          │      │
│ order_index         │  │        │          │ content              │      │
│ is_active           │  │        │          │ variables (JSONB)    │      │
│ created_at          │  │        │          │ visibility (enum)    │      │
│ updated_at          │  │        │          │ status (enum)        │      │
└─────────────────────┘  │        │          │ version              │      │
      ▲                  │        │          │ parent_prompt_id ────┼──┐   │
      └──────────────────┘        │          │ view_count           │  │   │
      (self-referencing)          │          │ copy_count           │  │   │
                                  │          │ fork_count           │  │   │
                                  │          │ favorite_count       │  │   │
┌─────────────────────┐           │          │ search_vector        │  │   │
│        tags         │           │          │ metadata (JSONB)     │  │   │
│─────────────────────│           │          │ created_at           │  │   │
│ id (PK)             │◀──────────┼───┐      │ updated_at           │  │   │
│ name (UNIQUE)       │           │   │      │ published_at         │  │   │
│ slug (UNIQUE)       │           │   │      └──────────────────────┘  │   │
│ usage_count         │           │   │               │                │   │
│ created_at          │           │   │               │ prompt_id (FK) │   │
│ updated_at          │           │   │               ▼                │   │
└─────────────────────┘           │   │      ┌──────────────────────┐  │   │
       ▲                          │   │      │  prompt_versions     │  │   │
       │                          │   │      │──────────────────────│  │   │
       │                          │   │      │ id (PK)              │  │   │
       │                          │   │      │ prompt_id (FK)       │  │   │
       │                          │   │      │ user_id (FK)         │  │   │
┌──────┴───────────┐              │   │      │ version              │  │   │
│   prompt_tags    │              │   │      │ title (snapshot)     │  │   │
│──────────────────│              │   │      │ content (snapshot)   │  │   │
│ prompt_id (FK)   │──────────────┘   │      │ variables (snapshot) │  │   │
│ tag_id (FK)      │──────────────────┘      │ change_summary       │  │   │
│ created_at       │                         │ created_at           │  │   │
└──────────────────┘                         └──────────────────────┘  │   │
  (composite PK)                                                       │   │
                                                                       │   │
                                              (self-referencing        │   │
                                               for forking) ───────────┘   │
┌─────────────────────┐                                                    │
│    collections      │                                                    │
│─────────────────────│                                                    │
│ id (PK)             │◀───────────┐                                       │
│ user_id (FK)        │────────────┼───────────────────────────────────────┘
│ name                │            │
│ slug                │            │
│ description         │            │
│ icon                │            │
│ visibility (enum)   │            │
│ prompt_count        │            │
│ favorite_count      │            │
│ order_index         │            │
│ created_at          │            │
│ updated_at          │            │
└─────────────────────┘            │
       ▲                           │
       │                           │
       │                           │
┌──────┴────────────────┐          │
│ collection_prompts    │          │
│───────────────────────│          │
│ collection_id (FK)    │          │
│ prompt_id (FK) ───────┼──────────┘
│ order_index           │
│ added_at              │
└───────────────────────┘
  (composite PK)


┌─────────────────────┐
│     favorites       │
│─────────────────────│
│ id (PK)             │
│ user_id (FK) ───────┼───┐
│ prompt_id (FK) ─────┼───┼─────┐
│ created_at          │   │     │
└─────────────────────┘   │     │
  (UNIQUE: user+prompt)   │     │
                          │     │
                          ▼     ▼
              Updates counters on both tables
```

## Relationship Summary

### One-to-Many Relationships

1. **users → prompts**
   - One user creates many prompts
   - Cascade delete: Delete user → Delete all their prompts

2. **users → collections**
   - One user creates many collections
   - Cascade delete: Delete user → Delete all their collections

3. **users → favorites**
   - One user has many favorites
   - Cascade delete: Delete user → Delete all their favorites

4. **categories → prompts**
   - One category has many prompts
   - Set null on delete: Delete category → Prompt category_id becomes NULL

5. **categories → categories** (self-referencing)
   - One parent category has many subcategories
   - Set null on delete: Delete parent → Subcategory parent_id becomes NULL

6. **prompts → prompt_versions**
   - One prompt has many versions
   - Cascade delete: Delete prompt → Delete all versions

7. **prompts → prompts** (self-referencing)
   - One prompt can be forked into many prompts
   - Set null on delete: Delete original → Forked prompt parent_id becomes NULL

### Many-to-Many Relationships

8. **prompts ↔ tags** (via prompt_tags)
   - One prompt can have many tags
   - One tag can be on many prompts
   - Cascade delete from both sides

9. **collections ↔ prompts** (via collection_prompts)
   - One collection can have many prompts
   - One prompt can be in many collections
   - Cascade delete from both sides

### Denormalized Relationships

10. **prompts.favorite_count** ← favorites
    - Updated via trigger when favorite added/removed

11. **prompts.view_count, copy_count, fork_count**
    - Updated by application code

12. **tags.usage_count** ← prompt_tags
    - Updated via trigger when prompt tagged/untagged

13. **collections.prompt_count** ← collection_prompts
    - Updated via trigger when prompt added/removed to collection

14. **users.total_prompts** ← prompts
    - Updated via trigger when prompt created/deleted

15. **users.total_collections** ← collections
    - Updated via trigger when collection created/deleted

16. **users.total_favorites** ← favorites
    - Updated via trigger when favorite added/removed

## Data Flow Examples

### Creating a Prompt

```
1. User creates prompt via API
   ↓
2. INSERT into prompts table
   ↓
3. TRIGGER: update_prompt_search_vector()
   - Auto-populate search_vector from title/description/content
   ↓
4. TRIGGER: update_user_stats()
   - Increment users.total_prompts
   ↓
5. Application adds tags
   ↓
6. INSERT into prompt_tags table
   ↓
7. TRIGGER: update_tag_usage_count()
   - Increment tags.usage_count for each tag
```

### Editing a Prompt

```
1. User updates prompt content
   ↓
2. UPDATE prompts table
   ↓
3. TRIGGER: handle_prompt_version()
   - INSERT old version into prompt_versions
   - DELETE versions older than 10
   - Increment prompts.version
   ↓
4. TRIGGER: update_prompt_search_vector()
   - Update search_vector with new content
   ↓
5. TRIGGER: handle_updated_at()
   - Update prompts.updated_at timestamp
```

### Favoriting a Prompt

```
1. User clicks favorite button
   ↓
2. INSERT into favorites table
   ↓
3. TRIGGER: update_favorite_count()
   - Increment prompts.favorite_count
   - Increment users.total_favorites
```

### Deleting a Prompt

```
1. User deletes prompt
   ↓
2. DELETE from prompts table (CASCADE)
   ↓
3. Auto-delete (CASCADE):
   - All prompt_versions for this prompt
   - All prompt_tags for this prompt
   - All collection_prompts for this prompt
   - All favorites for this prompt
   ↓
4. TRIGGER: update_user_stats()
   - Decrement users.total_prompts
   ↓
5. TRIGGER on prompt_tags DELETE: update_tag_usage_count()
   - Decrement tags.usage_count
   ↓
6. TRIGGER on collection_prompts DELETE: update_collection_prompt_count()
   - Decrement collections.prompt_count
   ↓
7. TRIGGER on favorites DELETE: update_favorite_count()
   - Decrement users.total_favorites
```

## Index Strategy

### Single-Column Indexes

**users**:
- `idx_users_username` - Fast username lookups
- `idx_users_created_at` - Sorting by join date

**categories**:
- `idx_categories_slug` - URL lookups
- `idx_categories_parent` - Finding subcategories
- `idx_categories_active` (partial) - Active categories only

**tags**:
- `idx_tags_slug` - URL lookups
- `idx_tags_usage_count` - Popular tags
- `idx_tags_name_trgm` (GIN) - Fuzzy search

**prompts**:
- `idx_prompts_user` - User's prompts
- `idx_prompts_category` - Category filtering
- `idx_prompts_visibility` - Public/private filtering
- `idx_prompts_status` - Draft/published filtering
- `idx_prompts_parent` - Finding forked prompts
- `idx_prompts_created_at` - Chronological sorting
- `idx_prompts_published_at` - Recent published
- `idx_prompts_favorite_count` - Popular prompts
- `idx_prompts_search_vector` (GIN) - Full-text search
- `idx_prompts_variables` (GIN) - JSONB queries

### Composite Indexes

**prompts**:
- `idx_prompts_public_published` (visibility, status, published_at)
  - WHERE visibility = 'public' AND status = 'published'
  - For homepage feed

- `idx_prompts_user_status` (user_id, status, updated_at)
  - For user dashboard

### Junction Tables

**prompt_tags**:
- `idx_prompt_tags_prompt` - Find tags for a prompt
- `idx_prompt_tags_tag` - Find prompts for a tag

**collection_prompts**:
- `idx_collection_prompts_collection` (collection_id, order_index)
  - For ordered collection view

- `idx_collection_prompts_prompt` - Find collections for a prompt

## Storage Estimation

### Per Record

- **Prompt** (avg): ~2KB
  - Title: 50 bytes
  - Description: 200 bytes
  - Content: 1500 bytes (avg)
  - Metadata: 250 bytes

- **Prompt Version** (avg): ~1.5KB (content + title only)

- **User**: ~1KB
- **Category**: ~500 bytes
- **Tag**: ~200 bytes
- **Collection**: ~1KB
- **Junction Records**: ~100 bytes each

### Free Tier Capacity (500MB)

With 10 versions per prompt:
- ~50,000 prompts
- ~500,000 versions (auto-managed)
- ~10,000 users
- ~100 categories
- ~1,000 tags
- ~50,000 collections

## Security Model

### Row-Level Security (RLS)

All tables have RLS enabled. Access rules:

**Public Data** (READ-ONLY):
- ✅ Categories (is_active = true)
- ✅ Tags (all)
- ✅ Prompts (visibility = 'public' AND status = 'published')
- ✅ Collections (visibility = 'public')

**Private Data** (OWNER ONLY):
- ✅ Prompts (user_id = current_user)
- ✅ Collections (user_id = current_user)
- ✅ Favorites (user_id = current_user)
- ✅ Prompt Versions (via prompt ownership)
- ✅ Prompt Tags (via prompt ownership)
- ✅ Collection Prompts (via collection ownership)

## Trigger Functions

1. **update_prompt_search_vector()** - Auto-update full-text search
2. **handle_prompt_version()** - Auto-create version snapshots
3. **handle_updated_at()** - Auto-update timestamps
4. **update_tag_usage_count()** - Track tag popularity
5. **update_user_stats()** - Maintain user counters
6. **update_favorite_count()** - Maintain favorite counters
7. **update_collection_prompt_count()** - Maintain collection sizes
8. **update_user_collection_count()** - Track user collections

## Utility Functions

1. **generate_unique_slug(title, user_id)** - Create URL-friendly slugs
2. **extract_prompt_variables(content)** - Parse template variables

---

**Legend**:
- PK = Primary Key
- FK = Foreign Key
- (enum) = Custom enum type
- (JSONB) = JSON binary column
- ─── = Foreign key relationship
- ──▶ = One-to-Many
- ◀─▶ = Many-to-Many (via junction table)
