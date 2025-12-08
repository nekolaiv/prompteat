"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/shared/components";
import { PromptForm } from "@/modules/prompts/presentation/components";
import { usePrompt, useCategories } from "@/modules/prompts/presentation/hooks";
import { useAuthContext } from "@/modules/auth/presentation/components";
import { useEffect } from "react";

export default function NewPromptPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthContext();
  const { categories } = useCategories();
  const { createPrompt, isLoading } = usePrompt();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    const prompt = await createPrompt(data);
    if (prompt) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Create New Prompt</h1>
        <PromptForm
          userId={user.id}
          categories={categories}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
