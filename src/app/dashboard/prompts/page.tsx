"use client";

import { Header } from "@/shared/components";
import { PromptList } from "@/modules/prompts/presentation/components";
import { usePrompts } from "@/modules/prompts/presentation/hooks";
import { useAuthContext } from "@/modules/auth/presentation/components";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyPromptsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthContext();
  const { prompts, isLoading } = usePrompts(user?.id);

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Prompts</h1>
            <p className="text-muted-foreground mt-2">Manage your prompt library</p>
          </div>
          <Button asChild>
            <Link href="/prompts/new">
              <Plus className="mr-2 h-5 w-5" />
              New Prompt
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <PromptList
            prompts={prompts}
            emptyMessage="You haven't created any prompts yet. Create your first one!"
          />
        )}
      </main>
    </div>
  );
}
