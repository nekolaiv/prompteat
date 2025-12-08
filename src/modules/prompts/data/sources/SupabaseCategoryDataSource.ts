import { SupabaseClient } from "@supabase/supabase-js";
import { CategoryModel } from "../models";

/**
 * Supabase data source for categories
 */
export class SupabaseCategoryDataSource {
  constructor(private supabase: SupabaseClient) {}

  async getAllCategories(): Promise<CategoryModel[]> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getCategoryById(id: string): Promise<CategoryModel | null> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async getCategoryBySlug(slug: string): Promise<CategoryModel | null> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data;
  }
}
