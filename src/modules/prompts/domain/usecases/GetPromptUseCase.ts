import { IPromptRepository } from "../repositories";
import { Prompt } from "../entities";
import { UUID } from "@/shared/types";

/**
 * Get prompt use case - Fetch single prompt and increment view count
 */
export class GetPromptUseCase {
  constructor(private promptRepository: IPromptRepository) {}

  async execute(id: UUID, incrementView: boolean = true): Promise<Prompt | null> {
    const prompt = await this.promptRepository.getById(id);

    // Increment view count if prompt exists and flag is true
    if (prompt && incrementView) {
      await this.promptRepository.incrementViewCount(id);
      prompt.viewCount += 1;
    }

    return prompt;
  }
}
