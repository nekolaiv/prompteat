import { SupabaseClient } from "@supabase/supabase-js";
import { UserModel } from "../models";

/**
 * Supabase authentication data source
 * Handles all direct interactions with Supabase Auth
 */
export class SupabaseAuthDataSource {
  constructor(private supabase: SupabaseClient) {}

  // Sign up user with email verification OTP
  // Username is stored in metadata and synced to users table via trigger
  async signUp(email: string, password: string, username?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        // Store username in user metadata - will be synced to public.users table
        data: {
          username,
          name: username,
        },
        // Email confirmation required - Supabase sends OTP automatically
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error) throw error;
    return user;
  }

  async refreshSession() {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.refreshSession();

    if (error) throw error;
    return session;
  }

  // Send password reset OTP to email
  // User will receive email with link containing OTP token
  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  }

  // Update password after OTP verification
  // Called after user clicks reset link from email
  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }

  // Update username in public.users table
  // RLS policy allows users to update their own data
  async updateUsername(userId: string, username: string) {
    const { error } = await this.supabase
      .from("users")
      .update({ username })
      .eq("id", userId);

    if (error) throw error;
  }

  async signInWithProvider(provider: "google" | "github") {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
    });

    if (error) throw error;
    return data;
  }

  async getUserProfile(userId: string): Promise<UserModel | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  }
}
