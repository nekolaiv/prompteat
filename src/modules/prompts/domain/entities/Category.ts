import { UUID, Timestamp } from "@/shared/types";

/**
 * Category entity - For organizing prompts
 */
export interface Category {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: UUID;
  orderIndex: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
