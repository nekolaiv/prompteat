import { IPromptRepository } from "../repositories";
import { UUID } from "@/shared/types";

/**
 * Delete prompt use case
 */
export class DeletePromptUseCase {
  constructor(private promptRepository: IPromptRepository) {}

  async execute(id: UUID): Promise<void> {
    await this.promptRepository.delete(id);
  }
}
