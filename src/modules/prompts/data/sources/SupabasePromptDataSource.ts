import { SupabaseClient } from "@supabase/supabase-js";
import { PromptModel } from "../models";

/**
 * Supabase data source for prompts
 * Handles all database interactions for prompts table
 */
export class SupabasePromptDataSource {
  constructor(private supabase: SupabaseClient) {}

  // Fetch prompt by ID with RLS policy check
  async getPromptById(id: string): Promise<PromptModel | null> {
    const { data, error } = await this.supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  // Fetch all prompts for a user (RLS ensures only user's prompts)
  async getPromptsByUserId(userId: string): Promise<PromptModel[]> {
    const { data, error } = await this.supabase
      .from("prompts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Fetch public published prompts (anyone can see)
  async getPublicPrompts(limit = 20, offset = 0): Promise<PromptModel[]> {
    const { data, error } = await this.supabase
      .from("prompts")
      .select("*")
      .eq("visibility", "public")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  // Full-text search on prompts
  async searchPrompts(query: string): Promise<PromptModel[]> {
    const { data, error } = await this.supabase
      .from("prompts")
      .select("*")
      .textSearch("search_vector", query)
      .eq("visibility", "public")
      .eq("status", "published")
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  // Create new prompt (RLS enforces user_id = auth.uid())
  async createPrompt(prompt: Partial<PromptModel>): Promise<PromptModel> {
    const { data, error } = await this.supabase
      .from("prompts")
      .insert(prompt)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update prompt (RLS enforces ownership)
  async updatePrompt(id: string, updates: Partial<PromptModel>): Promise<PromptModel> {
    const { data, error } = await this.supabase
      .from("prompts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete prompt (RLS enforces ownership)
  async deletePrompt(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("prompts")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    const { error } = await this.supabase.rpc("increment", {
      table_name: "prompts",
      row_id: id,
      column_name: "view_count",
    });

    if (error) {
      // Fallback if RPC doesn't exist
      const { data } = await this.supabase
        .from("prompts")
        .select("view_count")
        .eq("id", id)
        .single();

      if (data) {
        await this.supabase
          .from("prompts")
          .update({ view_count: data.view_count + 1 })
          .eq("id", id);
      }
    }
  }

  // Increment copy count
  async incrementCopyCount(id: string): Promise<void> {
    const { data } = await this.supabase
      .from("prompts")
      .select("copy_count")
      .eq("id", id)
      .single();

    if (data) {
      await this.supabase
        .from("prompts")
        .update({ copy_count: data.copy_count + 1 })
        .eq("id", id);
    }
  }
}
