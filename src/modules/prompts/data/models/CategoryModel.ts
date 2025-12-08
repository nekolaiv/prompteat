import { Category } from "../../domain/entities";

/**
 * Database model for categories
 */
export interface CategoryModel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Convert database model to domain entity
 */
export function toDomainCategory(model: CategoryModel): Category {
  return {
    id: model.id,
    name: model.name,
    slug: model.slug,
    description: model.description || undefined,
    icon: model.icon || undefined,
    parentId: model.parent_id || undefined,
    orderIndex: model.order_index,
    isActive: model.is_active,
    createdAt: model.created_at,
    updatedAt: model.updated_at,
  };
}
