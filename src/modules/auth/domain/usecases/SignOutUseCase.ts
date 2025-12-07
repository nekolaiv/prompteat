import { IAuthRepository } from "../repositories";

/**
 * Sign out use case - Business logic for user sign out
 */
export class SignOutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.signOut();
  }
}
