-- Migration: 003_create_categories_tags
-- Description: Create categories and tags tables for organization
-- Date: 2025-12-06

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- CATEGORIES TABLE
-- ============================================

CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Lucide icon name
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_categories_order ON public.categories(order_index);
CREATE INDEX idx_categories_active ON public.categories(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (is_active = true);

-- ============================================
-- TAGS TABLE
-- ============================================

CREATE TABLE public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_tags_usage_count ON public.tags(usage_count DESC);
CREATE INDEX idx_tags_name_trgm ON public.tags USING gin(name gin_trgm_ops);

-- RLS Policies
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT
  USING (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon, order_index) VALUES
  ('Creative Writing', 'creative-writing', 'Stories, poetry, and creative content', 'Pen', 1),
  ('Code Generation', 'code-generation', 'Programming and development prompts', 'Code', 2),
  ('Business', 'business', 'Marketing, sales, and business strategy', 'Briefcase', 3),
  ('Education', 'education', 'Learning and teaching resources', 'GraduationCap', 4),
  ('Data Analysis', 'data-analysis', 'Data processing and insights', 'BarChart', 5),
  ('Customer Support', 'customer-support', 'Help desk and support responses', 'Headset', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert common tags
INSERT INTO public.tags (name, slug) VALUES
  ('ChatGPT', 'chatgpt'),
  ('Claude', 'claude'),
  ('Marketing', 'marketing'),
  ('SEO', 'seo'),
  ('Python', 'python'),
  ('JavaScript', 'javascript'),
  ('Content Writing', 'content-writing'),
  ('Email', 'email'),
  ('Social Media', 'social-media'),
  ('Blog Post', 'blog-post')
ON CONFLICT (slug) DO NOTHING;

COMMIT;
