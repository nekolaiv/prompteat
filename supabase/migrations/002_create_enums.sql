-- Migration: 002_create_enums
-- Description: Create custom enum types for the application
-- Date: 2025-12-06

BEGIN;

-- Visibility levels for prompts
CREATE TYPE visibility_type AS ENUM ('public', 'private', 'unlisted');

-- Prompt status lifecycle
CREATE TYPE prompt_status AS ENUM ('draft', 'published', 'archived');

-- Collection visibility (MVP: public/private only)
CREATE TYPE collection_visibility AS ENUM ('public', 'private');

-- Variable types for prompt templates
CREATE TYPE variable_type AS ENUM ('text', 'textarea', 'number', 'select', 'multiselect');

COMMIT;
