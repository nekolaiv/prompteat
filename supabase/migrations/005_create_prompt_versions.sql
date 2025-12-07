-- Migration: 005_create_prompt_versions
-- Description: Create prompt_versions table for version history
-- Date: 2025-12-06

BEGIN;

-- ============================================
-- PROMPT_VERSIONS TABLE
-- ============================================

CREATE TABLE public.prompt_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,

  -- Snapshot of prompt at this version
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,

  -- Version metadata
  change_summary TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,

  CONSTRAINT unique_prompt_version UNIQUE(prompt_id, version)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_prompt_versions_prompt ON public.prompt_versions(prompt_id, version DESC);
CREATE INDEX idx_prompt_versions_created ON public.prompt_versions(created_at DESC);

-- ============================================
-- TRIGGER: Auto-create version on content change
-- ============================================

CREATE OR REPLACE FUNCTION handle_prompt_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content actually changed
  IF OLD.content IS DISTINCT FROM NEW.content OR
     OLD.title IS DISTINCT FROM NEW.title OR
     OLD.variables IS DISTINCT FROM NEW.variables THEN

    -- Save old version (only content + title for storage optimization)
    INSERT INTO public.prompt_versions (
      prompt_id, user_id, version, title, content, variables
    ) VALUES (
      OLD.id, OLD.user_id, OLD.version, OLD.title, OLD.content, OLD.variables
    );

    -- Keep only last 10 versions (free tier optimization)
    DELETE FROM public.prompt_versions
    WHERE prompt_id = OLD.id
      AND version NOT IN (
        SELECT version FROM public.prompt_versions
        WHERE prompt_id = OLD.id
        ORDER BY version DESC
        LIMIT 10
      );

    -- Increment version number
    NEW.version := OLD.version + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prompt_version_trigger
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION handle_prompt_version();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

-- Users can view versions of their prompts OR public prompts
CREATE POLICY "View prompt versions"
  ON public.prompt_versions FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.prompts
      WHERE id = prompt_versions.prompt_id
        AND visibility = 'public'
        AND status = 'published'
    )
  );

-- Only prompt owner can create versions (via trigger)
CREATE POLICY "Create prompt versions"
  ON public.prompt_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMIT;
