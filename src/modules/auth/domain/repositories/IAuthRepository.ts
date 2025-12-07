import { User, UserSession } from "../entities";

/**
 * Authentication repository interface
 * Defines the contract for authentication data operations
 */
export interface IAuthRepository {
  signUp(email: string, password: string, name?: string): Promise<UserSession>;
  signIn(email: string, password: string): Promise<UserSession>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshSession(): Promise<UserSession>;
  resetPassword(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  signInWithProvider(provider: AuthProvider): Promise<UserSession>;
}

export type AuthProvider = "google" | "github";
