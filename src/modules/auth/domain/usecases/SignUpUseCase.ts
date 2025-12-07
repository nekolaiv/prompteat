import { IAuthRepository } from "../repositories";
import { UserSession } from "../entities";

/**
 * Sign up use case - Business logic for user registration
 */
export class SignUpUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<UserSession> {
    // Validate all required fields
    if (!username || !email || !password || !confirmPassword) {
      throw new Error("All fields are required");
    }

    // Validate username format (3-30 chars, alphanumeric + dash/underscore)
    if (!this.isValidUsername(username)) {
      throw new Error("Username must be 3-30 characters (letters, numbers, -, _)");
    }

    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format");
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Execute sign up with username in metadata
    // Supabase will send email verification OTP automatically
    return await this.authRepository.signUp(email, password, username);
  }

  private isValidUsername(username: string): boolean {
    // Match database constraint: 3-30 chars, alphanumeric + dash/underscore
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

}
