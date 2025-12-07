-- Migration: 006_create_prompt_tags
-- Description: Create prompt_tags junction table
-- Date: 2025-12-06

BEGIN;

-- ============================================
-- PROMPT_TAGS TABLE (Junction Table)
-- ============================================

CREATE TABLE public.prompt_tags (
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,

  PRIMARY KEY (prompt_id, tag_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_prompt_tags_prompt ON public.prompt_tags(prompt_id);
CREATE INDEX idx_prompt_tags_tag ON public.prompt_tags(tag_id);

-- ============================================
-- TRIGGER: Update tag usage_count
-- ============================================

CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tags
    SET usage_count = usage_count + 1
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tags
    SET usage_count = GREATEST(0, usage_count - 1)
    WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tag_usage_count_trigger
  AFTER INSERT OR DELETE ON public.prompt_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.prompt_tags ENABLE ROW LEVEL SECURITY;

-- Tags viewable if prompt is viewable
CREATE POLICY "View prompt tags"
  ON public.prompt_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts
      WHERE id = prompt_tags.prompt_id
        AND (visibility = 'public' OR user_id = auth.uid())
    )
  );

-- Users can manage tags on their prompts
CREATE POLICY "Manage prompt tags"
  ON public.prompt_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prompts
      WHERE id = prompt_tags.prompt_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Delete prompt tags"
  ON public.prompt_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts
      WHERE id = prompt_tags.prompt_id AND user_id = auth.uid()
    )
  );

COMMIT;
