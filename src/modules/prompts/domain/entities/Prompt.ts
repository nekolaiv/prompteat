import { UUID, Timestamp } from "@/shared/types";

/**
 * Prompt entity - Core domain model for prompt management
 */
export interface Prompt {
  id: UUID;
  userId: UUID;
  categoryId?: UUID;
  title: string;
  slug: string;
  description?: string;
  content: string;
  variables: PromptVariable[];
  visibility: PromptVisibility;
  status: PromptStatus;
  version: number;
  parentPromptId?: UUID;
  viewCount: number;
  copyCount: number;
  forkCount: number;
  favoriteCount: number;
  metadata: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

/**
 * Template variable for dynamic prompts
 * Example: "Write about {{topic}}" where topic is a variable
 */
export interface PromptVariable {
  name: string;
  type: VariableType;
  description: string;
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

export type PromptVisibility = "public" | "private" | "unlisted";
export type PromptStatus = "draft" | "published" | "archived";
export type VariableType = "text" | "textarea" | "number" | "select" | "multiselect";
