"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/shared/components";
import { PromptFormEnhanced } from "@/modules/prompts/presentation/components";
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    const prompt = await createPrompt(data);
    if (prompt) {
      router.push("/dashboard/prompts");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <PromptFormEnhanced
          userId={user.id}
          categories={categories}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
