"use client";

import { Header } from "@/shared/components";
import { PromptList } from "@/modules/prompts/presentation/components";
import { usePrompts } from "@/modules/prompts/presentation/hooks";

export default function PromptsPage() {
  const { prompts, isLoading } = usePrompts();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Explore Prompts</h1>
          <p className="text-muted-foreground mt-2">
            Discover and use prompts created by the community
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <PromptList prompts={prompts} emptyMessage="No prompts found. Be the first to create one!" />
        )}
      </main>
    </div>
  );
}
