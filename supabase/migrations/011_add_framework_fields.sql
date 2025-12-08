-- Migration: 011_add_framework_fields
-- Description: Add framework and framework_data columns to prompts table for structured prompt engineering
-- Date: 2025-12-08

BEGIN;

-- Add framework type column
ALTER TABLE public.prompts
  ADD COLUMN framework TEXT,
  ADD COLUMN framework_data JSONB DEFAULT '{}'::jsonb;

-- Add index for framework queries
CREATE INDEX idx_prompts_framework ON public.prompts(framework) WHERE framework IS NOT NULL;

-- Add GIN index for framework_data JSONB queries
CREATE INDEX idx_prompts_framework_data ON public.prompts USING gin(framework_data);

-- Add constraint to validate framework type
ALTER TABLE public.prompts
  ADD CONSTRAINT valid_framework CHECK (
    framework IS NULL OR
    framework IN ('COSTAR', 'CRISPE', 'RACE', 'BASIC', 'FREEFORM')
  );

COMMIT;
