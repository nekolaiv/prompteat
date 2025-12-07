import { IAuthRepository } from "../repositories";

/**
 * Forgot password use case - Handles password reset via email OTP
 * Flow: User requests OTP -> OTP sent to email -> User verifies OTP and sets new password
 */
export class ForgotPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  // Step 1: Request password reset OTP via email
  async requestReset(email: string): Promise<void> {
    // Validate email format
    if (!email || !this.isValidEmail(email)) {
      throw new Error("Valid email is required");
    }

    // Send reset email with OTP through Supabase
    await this.authRepository.resetPassword(email);
  }

  // Step 2: Verify OTP and update password
  async updatePassword(newPassword: string, confirmPassword: string): Promise<void> {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // Validate password strength (min 8 chars)
    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Update password through repository
    await this.authRepository.updatePassword(newPassword);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
