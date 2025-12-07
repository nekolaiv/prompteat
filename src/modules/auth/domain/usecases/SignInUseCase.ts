    import { IAuthRepository } from "../repositories";
import { UserSession } from "../entities";

/**
 * Sign in use case - Business logic for user sign in
 */
export class SignInUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, password: string): Promise<UserSession> {
    // Validate inputs
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format");
    }

    // Execute sign in through repository
    return await this.authRepository.signIn(email, password);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
    