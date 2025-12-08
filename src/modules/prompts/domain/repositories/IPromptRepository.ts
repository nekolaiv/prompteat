import { Prompt } from "../entities";
import { UUID } from "@/shared/types";

/**
 * Prompt repository interface
 * Defines contract for prompt data operations
 */
export interface IPromptRepository {
  // Read operations
  getById(id: UUID): Promise<Prompt | null>;
  getByUserId(userId: UUID): Promise<Prompt[]>;
  getPublicPrompts(limit?: number, offset?: number): Promise<Prompt[]>;
  searchPrompts(query: string): Promise<Prompt[]>;

  // Write operations
  create(prompt: CreatePromptDTO): Promise<Prompt>;
  update(id: UUID, updates: UpdatePromptDTO): Promise<Prompt>;
  delete(id: UUID): Promise<void>;

  // Engagement
  incrementViewCount(id: UUID): Promise<void>;
  incrementCopyCount(id: UUID): Promise<void>;
}

export interface CreatePromptDTO {
  userId: UUID;
  categoryId?: UUID;
  title: string;
  description?: string;
  content: string;
  visibility?: "public" | "private" | "unlisted";
  status?: "draft" | "published";
}

export interface UpdatePromptDTO {
  title?: string;
  description?: string;
  content?: string;
  categoryId?: UUID;
  visibility?: "public" | "private" | "unlisted";
  status?: "draft" | "published";
}
