import { Prompt, PromptVariable } from "../../domain/entities";

/**
 * Database model for prompts (matches Supabase schema)
 */
export interface PromptModel {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  variables: any; // JSONB field from database
  visibility: string;
  status: string;
  version: number;
  parent_prompt_id: string | null;
  view_count: number;
  copy_count: number;
  fork_count: number;
  favorite_count: number;
  metadata: any;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/**
 * Convert database model to domain entity
 */
export function toDomainPrompt(model: PromptModel): Prompt {
  return {
    id: model.id,
    userId: model.user_id,
    categoryId: model.category_id || undefined,
    title: model.title,
    slug: model.slug,
    description: model.description || undefined,
    content: model.content,
    variables: Array.isArray(model.variables) ? model.variables : [],
    visibility: model.visibility as any,
    status: model.status as any,
    version: model.version,
    parentPromptId: model.parent_prompt_id || undefined,
    viewCount: model.view_count,
    copyCount: model.copy_count,
    forkCount: model.fork_count,
    favoriteCount: model.favorite_count,
    metadata: model.metadata || {},
    createdAt: model.created_at,
    updatedAt: model.updated_at,
    publishedAt: model.published_at || undefined,
  };
}

/**
 * Convert domain entity to database model for inserts/updates
 */
export function toPromptModel(prompt: Partial<Prompt>): Partial<PromptModel> {
  return {
    user_id: prompt.userId,
    category_id: prompt.categoryId || null,
    title: prompt.title,
    description: prompt.description || null,
    content: prompt.content,
    variables: prompt.variables || [],
    visibility: prompt.visibility,
    status: prompt.status,
  };
}
