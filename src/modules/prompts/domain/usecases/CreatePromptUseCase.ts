import { IPromptRepository, CreatePromptDTO } from "../repositories";
import { Prompt } from "../entities";

/**
 * Create prompt use case - Business logic for creating prompts
 */
export class CreatePromptUseCase {
  constructor(private promptRepository: IPromptRepository) {}

  async execute(data: CreatePromptDTO): Promise<Prompt> {
    // Validate title (3-200 chars matching DB constraint)
    if (!data.title || data.title.length < 3 || data.title.length > 200) {
      throw new Error("Title must be 3-200 characters");
    }

    // Validate content (10-10000 chars matching DB constraint)
    if (!data.content || data.content.length < 10 || data.content.length > 10000) {
      throw new Error("Content must be 10-10000 characters");
    }

    // Validate description if provided
    if (data.description && data.description.length > 500) {
      throw new Error("Description must be max 500 characters");
    }

    // Create prompt through repository
    return await this.promptRepository.create(data);
  }
}
