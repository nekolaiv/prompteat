"use client";

import { useState } from "react";
import { Prompt } from "../../domain/entities";
import { createClientComponentClient } from "@/shared/config/supabase-client";
import { SupabasePromptDataSource } from "../../data/sources";
import { PromptRepository } from "../../data/repositories";
import { CreatePromptUseCase, UpdatePromptUseCase, DeletePromptUseCase } from "../../domain/usecases";
import { CreatePromptDTO, UpdatePromptDTO } from "../../domain/repositories";

export function usePrompt() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const dataSource = new SupabasePromptDataSource(supabase);
  const repository = new PromptRepository(dataSource);

  const createPrompt = async (data: CreatePromptDTO): Promise<Prompt | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const useCase = new CreatePromptUseCase(repository);
      return await useCase.execute(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prompt");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrompt = async (id: string, data: UpdatePromptDTO): Promise<Prompt | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const useCase = new UpdatePromptUseCase(repository);
      return await useCase.execute(id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update prompt");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrompt = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const useCase = new DeletePromptUseCase(repository);
      await useCase.execute(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete prompt");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPrompt,
    updatePrompt,
    deletePrompt,
    isLoading,
    error,
  };
}
