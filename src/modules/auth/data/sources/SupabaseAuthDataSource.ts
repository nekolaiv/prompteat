import { SupabaseClient } from "@supabase/supabase-js";
import { UserModel } from "../models";

/**
 * Supabase authentication data source
 * Handles all direct interactions with Supabase Auth
 */
export class SupabaseAuthDataSource {
  constructor(private supabase: SupabaseClient) {}

  async signUp(email: string, password: string, name?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
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

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });
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
