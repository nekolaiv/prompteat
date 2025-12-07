-- Migration: 010_seed_data
-- Description: Additional seed data and example prompts (optional)
-- Date: 2025-12-06

BEGIN;

-- ============================================
-- ADDITIONAL TAGS
-- ============================================

INSERT INTO public.tags (name, slug) VALUES
  ('TypeScript', 'typescript'),
  ('React', 'react'),
  ('Next.js', 'nextjs'),
  ('Product Description', 'product-description'),
  ('Resume', 'resume'),
  ('Cover Letter', 'cover-letter'),
  ('Tutorial', 'tutorial'),
  ('Documentation', 'documentation'),
  ('Research', 'research'),
  ('Translation', 'translation')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- EXAMPLE: Create a sample prompt (commented out)
-- Uncomment if you want sample data for testing
-- ============================================

/*
-- Example prompt (requires a valid user_id)
INSERT INTO public.prompts (
  user_id,
  category_id,
  title,
  slug,
  description,
  content,
  visibility,
  status,
  published_at
) VALUES (
  'REPLACE_WITH_REAL_USER_ID'::uuid,
  (SELECT id FROM public.categories WHERE slug = 'creative-writing'),
  'Creative Story Generator',
  'creative-story-generator',
  'Generate engaging stories based on a theme and genre',
  'Write a creative {{story_length}} story about {{theme}} in the {{genre}} genre. The story should include:

- A compelling protagonist
- An interesting conflict or challenge
- A satisfying resolution
- Vivid descriptions and dialogue

Make it engaging and suitable for {{target_audience}}.',
  'public',
  'published',
  timezone('utc', now())
);
*/

COMMIT;
