import { IPromptRepository } from "../repositories";
import { Prompt } from "../entities";
import { UUID } from "@/shared/types";

/**
 * Get user prompts use case - Fetch all prompts for a user
 */
export class GetUserPromptsUseCase {
  constructor(private promptRepository: IPromptRepository) {}

  async execute(userId: UUID): Promise<Prompt[]> {
    return await this.promptRepository.getByUserId(userId);
  }
}
