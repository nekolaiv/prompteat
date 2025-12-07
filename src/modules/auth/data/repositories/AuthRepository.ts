import { IAuthRepository, AuthProvider } from "../../domain/repositories";
import { User, UserSession } from "../../domain/entities";
import { SupabaseAuthDataSource } from "../sources";
import { toDomainUser } from "../models";

/**
 * Authentication repository implementation
 * Implements the domain repository interface using Supabase
 */
export class AuthRepository implements IAuthRepository {
  constructor(private dataSource: SupabaseAuthDataSource) {}

  async signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<UserSession> {
    const authData = await this.dataSource.signUp(email, password, name);

    // User exists but session is null when email confirmation is required
    if (!authData.user) {
      throw new Error("Sign up failed");
    }

    const user: User = {
      id: authData.user.id,
      email: authData.user.email!,
      name: name || authData.user.user_metadata?.name,
      avatarUrl: authData.user.user_metadata?.avatar_url,
      createdAt: authData.user.created_at,
      updatedAt: authData.user.updated_at || authData.user.created_at,
    };

    // Session will be null until email is confirmed
    if (!authData.session) {
      return {
        user,
        accessToken: "",
        refreshToken: "",
        expiresAt: "",
      };
    }

    return {
      user,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresAt: new Date(authData.session.expires_at! * 1000).toISOString(),
    };
  }

  async signIn(email: string, password: string): Promise<UserSession> {
    const authData = await this.dataSource.signIn(email, password);

    if (!authData.user || !authData.session) {
      throw new Error("Sign in failed");
    }

    const user: User = {
      id: authData.user.id,
      email: authData.user.email!,
      name: authData.user.user_metadata?.name,
      avatarUrl: authData.user.user_metadata?.avatar_url,
      createdAt: authData.user.created_at,
      updatedAt: authData.user.updated_at || authData.user.created_at,
    };

    return {
      user,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresAt: new Date(authData.session.expires_at! * 1000).toISOString(),
    };
  }

  async signOut(): Promise<void> {
    await this.dataSource.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const supabaseUser = await this.dataSource.getCurrentUser();

    if (!supabaseUser) {
      return null;
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.name,
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
    };
  }

  async refreshSession(): Promise<UserSession> {
    const session = await this.dataSource.refreshSession();

    if (!session || !session.user) {
      throw new Error("Session refresh failed");
    }

    const user: User = {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata?.name,
      avatarUrl: session.user.user_metadata?.avatar_url,
      createdAt: session.user.created_at,
      updatedAt: session.user.updated_at || session.user.created_at,
    };

    return {
      user,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: new Date(session.expires_at! * 1000).toISOString(),
    };
  }

  async resetPassword(email: string): Promise<void> {
    await this.dataSource.resetPassword(email);
  }

  async updatePassword(newPassword: string): Promise<void> {
    await this.dataSource.updatePassword(newPassword);
  }

  async signInWithProvider(provider: AuthProvider): Promise<UserSession> {
    const authData = await this.dataSource.signInWithProvider(provider);

    // OAuth flow redirects, so this might not return session immediately
    throw new Error("OAuth sign in initiated - handle callback separately");
  }
}
