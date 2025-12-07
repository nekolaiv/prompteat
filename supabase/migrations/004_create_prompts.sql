-- Migration: 004_create_prompts
-- Description: Create prompts table with full-text search and indexing
-- Date: 2025-12-06

BEGIN;

-- ============================================
-- PROMPTS TABLE
-- ============================================

CREATE TABLE public.prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,

  -- Content
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,

  -- Template system (JSONB array of variables)
  variables JSONB DEFAULT '[]'::jsonb,

  -- Visibility & Status
  visibility visibility_type DEFAULT 'private' NOT NULL,
  status prompt_status DEFAULT 'draft' NOT NULL,

  -- Versioning
  version INTEGER DEFAULT 1 NOT NULL,
  parent_prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,

  -- Engagement metrics (denormalized for performance)
  view_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,

  -- Full-text search
  search_vector tsvector,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,

  -- Constraints (optimized for free tier)
  CONSTRAINT title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  CONSTRAINT content_length CHECK (char_length(content) >= 10 AND char_length(content) <= 10000),
  CONSTRAINT description_length CHECK (char_length(description) <= 500),
  CONSTRAINT unique_user_slug UNIQUE(user_id, slug)
);

-- ============================================
-- INDEXES
-- ============================================

-- Single-column indexes
CREATE INDEX idx_prompts_user ON public.prompts(user_id);
CREATE INDEX idx_prompts_category ON public.prompts(category_id);
CREATE INDEX idx_prompts_visibility ON public.prompts(visibility);
CREATE INDEX idx_prompts_status ON public.prompts(status);
CREATE INDEX idx_prompts_parent ON public.prompts(parent_prompt_id);
CREATE INDEX idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX idx_prompts_published_at ON public.prompts(published_at DESC NULLS LAST);
CREATE INDEX idx_prompts_view_count ON public.prompts(view_count DESC);
CREATE INDEX idx_prompts_favorite_count ON public.prompts(favorite_count DESC);

-- GIN indexes for full-text search and JSONB
CREATE INDEX idx_prompts_search_vector ON public.prompts USING gin(search_vector);
CREATE INDEX idx_prompts_variables ON public.prompts USING gin(variables);

-- Composite indexes for common query patterns
CREATE INDEX idx_prompts_public_published
  ON public.prompts(visibility, status, published_at DESC)
  WHERE visibility = 'public' AND status = 'published';

CREATE INDEX idx_prompts_user_status
  ON public.prompts(user_id, status, updated_at DESC);

-- ============================================
-- TRIGGER: Auto-update search vector
-- ============================================

CREATE OR REPLACE FUNCTION update_prompt_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prompt_search_vector_update
  BEFORE INSERT OR UPDATE OF title, description, content
  ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_prompt_search_vector();

-- ============================================
-- TRIGGER: Auto-update timestamps
-- ============================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prompt_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Public prompts are viewable by everyone
CREATE POLICY "Public prompts viewable by all"
  ON public.prompts FOR SELECT
  USING (visibility = 'public' AND status = 'published');

-- Users can view their own prompts
CREATE POLICY "Users view own prompts"
  ON public.prompts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own prompts
CREATE POLICY "Users insert own prompts"
  ON public.prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own prompts
CREATE POLICY "Users update own prompts"
  ON public.prompts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own prompts
CREATE POLICY "Users delete own prompts"
  ON public.prompts FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;
