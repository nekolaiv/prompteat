-- Migration: 007_create_collections
-- Description: Create collections and collection_prompts tables
-- Date: 2025-12-06

BEGIN;

-- ============================================
-- COLLECTIONS TABLE
-- ============================================

CREATE TABLE public.collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Lucide icon name

  visibility collection_visibility DEFAULT 'private' NOT NULL,

  prompt_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,

  order_index INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,

  CONSTRAINT unique_user_collection_slug UNIQUE(user_id, slug)
);

-- ============================================
-- COLLECTION_PROMPTS TABLE (Junction Table)
-- ============================================

CREATE TABLE public.collection_prompts (
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,

  PRIMARY KEY (collection_id, prompt_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Collections indexes
CREATE INDEX idx_collections_user ON public.collections(user_id);
CREATE INDEX idx_collections_visibility ON public.collections(visibility);
CREATE INDEX idx_collections_created_at ON public.collections(created_at DESC);

-- Collection prompts indexes
CREATE INDEX idx_collection_prompts_collection ON public.collection_prompts(collection_id, order_index);
CREATE INDEX idx_collection_prompts_prompt ON public.collection_prompts(prompt_id);

-- ============================================
-- TRIGGER: Update collection prompt_count
-- ============================================

CREATE OR REPLACE FUNCTION update_collection_prompt_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.collections
    SET prompt_count = prompt_count + 1
    WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.collections
    SET prompt_count = GREATEST(0, prompt_count - 1)
    WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collection_prompt_count_trigger
  AFTER INSERT OR DELETE ON public.collection_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_prompt_count();

-- ============================================
-- TRIGGER: Auto-update timestamps on collections
-- ============================================

CREATE TRIGGER collection_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- TRIGGER: Update user collection count
-- ============================================

CREATE OR REPLACE FUNCTION update_user_collection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users
    SET total_collections = total_collections + 1
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users
    SET total_collections = GREATEST(0, total_collections - 1)
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_collection_count_trigger
  AFTER INSERT OR DELETE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION update_user_collection_count();

-- ============================================
-- RLS POLICIES: Collections
-- ============================================

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Public collections viewable by all
CREATE POLICY "View public collections"
  ON public.collections FOR SELECT
  USING (visibility = 'public');

-- Users view their own collections
CREATE POLICY "View own collections"
  ON public.collections FOR SELECT
  USING (auth.uid() = user_id);

-- Users manage their own collections
CREATE POLICY "Manage own collections"
  ON public.collections FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES: Collection Prompts
-- ============================================

ALTER TABLE public.collection_prompts ENABLE ROW LEVEL SECURITY;

-- View collection prompts if collection is viewable
CREATE POLICY "View collection prompts"
  ON public.collection_prompts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE id = collection_prompts.collection_id
        AND (visibility = 'public' OR user_id = auth.uid())
    )
  );

-- Manage prompts in own collections
CREATE POLICY "Insert collection prompts"
  ON public.collection_prompts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE id = collection_prompts.collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Update collection prompts"
  ON public.collection_prompts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE id = collection_prompts.collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Delete collection prompts"
  ON public.collection_prompts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE id = collection_prompts.collection_id AND user_id = auth.uid()
    )
  );

COMMIT;
