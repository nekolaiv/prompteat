import { IPromptRepository, CreatePromptDTO, UpdatePromptDTO } from "../../domain/repositories";
import { Prompt } from "../../domain/entities";
import { SupabasePromptDataSource } from "../sources";
import { toDomainPrompt, toPromptModel } from "../models";
import { UUID } from "@/shared/types";

/**
 * Prompt repository implementation
 * Converts between domain entities and database models
 */
export class PromptRepository implements IPromptRepository {
  constructor(private dataSource: SupabasePromptDataSource) {}

  async getById(id: UUID): Promise<Prompt | null> {
    const model = await this.dataSource.getPromptById(id);
    return model ? toDomainPrompt(model) : null;
  }

  async getByUserId(userId: UUID): Promise<Prompt[]> {
    const models = await this.dataSource.getPromptsByUserId(userId);
    return models.map(toDomainPrompt);
  }

  async getPublicPrompts(limit = 20, offset = 0): Promise<Prompt[]> {
    const models = await this.dataSource.getPublicPrompts(limit, offset);
    return models.map(toDomainPrompt);
  }

  async searchPrompts(query: string): Promise<Prompt[]> {
    const models = await this.dataSource.searchPrompts(query);
    return models.map(toDomainPrompt);
  }

  async create(data: CreatePromptDTO): Promise<Prompt> {
    // Generate slug from title (simple version)
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const promptData = {
      user_id: data.userId,
      category_id: data.categoryId || null,
      title: data.title,
      slug,
      description: data.description || null,
      content: data.content,
      visibility: data.visibility || "private",
      status: data.status || "draft",
      variables: [],
      metadata: {},
      view_count: 0,
      copy_count: 0,
      fork_count: 0,
      favorite_count: 0,
      version: 1,
    };

    const model = await this.dataSource.createPrompt(promptData);
    return toDomainPrompt(model);
  }

  async update(id: UUID, updates: UpdatePromptDTO): Promise<Prompt> {
    const updateData = toPromptModel(updates as any);
    const model = await this.dataSource.updatePrompt(id, updateData);
    return toDomainPrompt(model);
  }

  async delete(id: UUID): Promise<void> {
    await this.dataSource.deletePrompt(id);
  }

  async incrementViewCount(id: UUID): Promise<void> {
    await this.dataSource.incrementViewCount(id);
  }

  async incrementCopyCount(id: UUID): Promise<void> {
    await this.dataSource.incrementCopyCount(id);
  }
}
