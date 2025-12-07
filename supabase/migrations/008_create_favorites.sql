-- Migration: 008_create_favorites
-- Description: Create favorites table for user bookmarks
-- Date: 2025-12-06

BEGIN;

-- ============================================
-- FAVORITES TABLE
-- ============================================

CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,

  CONSTRAINT unique_user_prompt_favorite UNIQUE(user_id, prompt_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_favorites_user ON public.favorites(user_id, created_at DESC);
CREATE INDEX idx_favorites_prompt ON public.favorites(prompt_id);

-- ============================================
-- TRIGGER: Update favorite counts
-- ============================================

CREATE OR REPLACE FUNCTION update_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment prompt favorite_count
    UPDATE public.prompts
    SET favorite_count = favorite_count + 1
    WHERE id = NEW.prompt_id;

    -- Increment user total_favorites
    UPDATE public.users
    SET total_favorites = total_favorites + 1
    WHERE id = NEW.user_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement prompt favorite_count
    UPDATE public.prompts
    SET favorite_count = GREATEST(0, favorite_count - 1)
    WHERE id = OLD.prompt_id;

    -- Decrement user total_favorites
    UPDATE public.users
    SET total_favorites = GREATEST(0, total_favorites - 1)
    WHERE id = OLD.user_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER favorite_count_trigger
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorite_count();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users view only their own favorites
CREATE POLICY "View own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;
