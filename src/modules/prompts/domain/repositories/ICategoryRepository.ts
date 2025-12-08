import { Category } from "../entities";
import { UUID } from "@/shared/types";

/**
 * Category repository interface
 */
export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: UUID): Promise<Category | null>;
  getBySlug(slug: string): Promise<Category | null>;
}
