"use client";

import { useState, useEffect } from "react";
import { Category } from "../../domain/entities";
import { createClientComponentClient } from "@/shared/config/supabase-client";
import { SupabaseCategoryDataSource } from "../../data/sources";
import { CategoryRepository } from "../../data/repositories";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const supabase = createClientComponentClient();
        const dataSource = new SupabaseCategoryDataSource(supabase);
        const repository = new CategoryRepository(dataSource);
        const data = await repository.getAll();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}
