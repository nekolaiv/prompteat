import { UUID, Timestamp } from "@/shared/types";

/**
 * Tag entity - For categorizing and filtering prompts
 */
export interface Tag {
  id: UUID;
  name: string;
  slug: string;
  usageCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
