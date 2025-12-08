import { IPromptRepository, UpdatePromptDTO } from "../repositories";
import { Prompt } from "../entities";
import { UUID } from "@/shared/types";

/**
 * Update prompt use case - Business logic for updating prompts
 */
export class UpdatePromptUseCase {
  constructor(private promptRepository: IPromptRepository) {}

  async execute(id: UUID, data: UpdatePromptDTO): Promise<Prompt> {
    // Validate title if provided
    if (data.title && (data.title.length < 3 || data.title.length > 200)) {
      throw new Error("Title must be 3-200 characters");
    }

    // Validate content if provided
    if (data.content && (data.content.length < 10 || data.content.length > 10000)) {
      throw new Error("Content must be 10-10000 characters");
    }

    // Validate description if provided
    if (data.description && data.description.length > 500) {
      throw new Error("Description must be max 500 characters");
    }

    // Update prompt through repository
    return await this.promptRepository.update(id, data);
  }
}
