-- Migration: 009_create_functions
-- Description: Create utility functions for the application
-- Date: 2025-12-06

BEGIN;

-- ============================================
-- FUNCTION: Generate unique slug
-- ============================================

CREATE OR REPLACE FUNCTION generate_unique_slug(
  p_title TEXT,
  p_user_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  v_counter INTEGER := 0;
  v_unique BOOLEAN := FALSE;
BEGIN
  -- Convert title to slug
  v_slug := lower(regexp_replace(p_title, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  v_slug := substring(v_slug from 1 for 100); -- Limit length

  -- Handle empty slugs
  IF v_slug = '' THEN
    v_slug := 'untitled';
  END IF;

  -- Ensure uniqueness
  WHILE NOT v_unique LOOP
    IF v_counter > 0 THEN
      v_slug := substring(v_slug from 1 for 95) || '-' || v_counter;
    END IF;

    SELECT NOT EXISTS (
      SELECT 1 FROM public.prompts
      WHERE user_id = p_user_id AND slug = v_slug
    ) INTO v_unique;

    v_counter := v_counter + 1;

    -- Safety: prevent infinite loop
    IF v_counter > 100 THEN
      v_slug := v_slug || '-' || extract(epoch from now())::text;
      EXIT;
    END IF;
  END LOOP;

  RETURN v_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Extract variables from prompt content
-- ============================================

CREATE OR REPLACE FUNCTION extract_prompt_variables(
  p_content TEXT
) RETURNS JSONB AS $$
DECLARE
  v_variables TEXT[];
  v_result JSONB := '[]'::jsonb;
BEGIN
  -- Match {{variable_name}} patterns
  SELECT array_agg(DISTINCT match[1])
  INTO v_variables
  FROM regexp_matches(p_content, '\{\{([a-zA-Z0-9_]+)\}\}', 'g') AS match;

  -- Convert to JSONB array
  IF v_variables IS NOT NULL THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', var,
        'type', 'text',
        'description', '',
        'required', true,
        'default', ''
      )
    )
    INTO v_result
    FROM unnest(v_variables) AS var;
  END IF;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Update user stats
-- ============================================

CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users
    SET total_prompts = total_prompts + 1
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users
    SET total_prompts = GREATEST(0, total_prompts - 1)
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_stats_trigger
  AFTER INSERT OR DELETE ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

COMMIT;
