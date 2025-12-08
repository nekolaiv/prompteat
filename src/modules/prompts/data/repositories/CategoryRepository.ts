import { ICategoryRepository } from "../../domain/repositories";
import { Category } from "../../domain/entities";
import { SupabaseCategoryDataSource } from "../sources";
import { toDomainCategory } from "../models";
import { UUID } from "@/shared/types";

/**
 * Category repository implementation
 */
export class CategoryRepository implements ICategoryRepository {
  constructor(private dataSource: SupabaseCategoryDataSource) {}

  async getAll(): Promise<Category[]> {
    const models = await this.dataSource.getAllCategories();
    return models.map(toDomainCategory);
  }

  async getById(id: UUID): Promise<Category | null> {
    const model = await this.dataSource.getCategoryById(id);
    return model ? toDomainCategory(model) : null;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    const model = await this.dataSource.getCategoryBySlug(slug);
    return model ? toDomainCategory(model) : null;
  }
}
