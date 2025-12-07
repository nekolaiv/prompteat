import { IAuthRepository } from "../repositories";
import { UserSession } from "../entities";

/**
 * Sign up use case - Business logic for user registration
 */
export class SignUpUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(
    email: string,
    password: string,
    name?: string
  ): Promise<UserSession> {
    // Validate inputs
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format");
    }

    if (!this.isValidPassword(password)) {
      throw new Error(
        "Password must be at least 8 characters long and contain uppercase, lowercase, and numbers"
      );
    }

    // Execute sign up through repository
    return await this.authRepository.signUp(email, password, name);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, contains uppercase, lowercase, and number
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  }
}
