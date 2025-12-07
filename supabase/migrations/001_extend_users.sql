-- Migration: 001_extend_users
-- Description: Extend users table with additional profile fields
-- Date: 2025-12-06

BEGIN;

-- Add new columns to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS total_prompts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_collections INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_favorites INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add constraints
ALTER TABLE public.users
  ADD CONSTRAINT IF NOT EXISTS username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  ADD CONSTRAINT IF NOT EXISTS username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_total_prompts ON public.users(total_prompts DESC);

COMMIT;
