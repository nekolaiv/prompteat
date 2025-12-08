"use client";

import { useState, useEffect } from "react";
import { Prompt } from "../../domain/entities";
import { createClientComponentClient } from "@/shared/config/supabase-client";
import { SupabasePromptDataSource } from "../../data/sources";
import { PromptRepository } from "../../data/repositories";

export function usePrompts(userId?: string) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if userId is expected but not yet available
    if (userId === undefined) {
      return;
    }

    const fetchPrompts = async () => {
      try {
        setIsLoading(true);
        const supabase = createClientComponentClient();
        const dataSource = new SupabasePromptDataSource(supabase);
        const repository = new PromptRepository(dataSource);

        const data = userId
          ? await repository.getByUserId(userId)
          : await repository.getPublicPrompts();

        setPrompts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch prompts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [userId]);

  return { prompts, isLoading, error };
}
