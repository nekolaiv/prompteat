"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prompt } from "@/modules/prompts/domain/entities";
import { createClientComponentClient } from "@/shared/config/supabase-client";
import { SupabasePromptDataSource } from "@/modules/prompts/data/sources";
import { PromptRepository } from "@/modules/prompts/data/repositories";
import { ArrowLeft } from "lucide-react";
import { useAuthContext } from "@/modules/auth/presentation/components";
import { PromptForm } from "@/modules/prompts/presentation/components/PromptForm";
import { usePrompt } from "@/modules/prompts/presentation/hooks/usePrompt";
import { useCategories } from "@/modules/prompts/presentation/hooks/useCategories";
import { UpdatePromptDTO } from "@/modules/prompts/domain/repositories";

export default function EditPromptPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthContext();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updatePrompt, isLoading: updating } = usePrompt();
  const { categories } = useCategories();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
      return;
    }

    const fetchPrompt = async () => {
      try {
        setIsLoading(true);
        const supabase = createClientComponentClient();
        const dataSource = new SupabasePromptDataSource(supabase);
        const repository = new PromptRepository(dataSource);

        const data = await repository.getById(params.id as string);

        if (!data) {
          setError("Prompt not found");
          return;
        }

        // Check ownership
        if (data.userId !== user?.id) {
          setError("You don't have permission to edit this prompt");
          return;
        }

        setPrompt(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch prompt");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id && user) {
      fetchPrompt();
    }
  }, [params.id, user, authLoading, router]);

  const handleSubmit = async (data: UpdatePromptDTO) => {
    const updated = await updatePrompt(params.id as string, data);
    if (updated) {
      router.push(`/prompts/${params.id}`);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-2xl font-bold mb-4">Cannot Edit Prompt</h1>
            <p className="text-muted-foreground mb-6">{error || "This prompt doesn't exist or you don't have permission."}</p>
            <Button onClick={() => router.push("/dashboard/prompts")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Edit Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <PromptForm
                categories={categories}
                onSubmit={handleSubmit}
                isLoading={updating}
                initialData={prompt}
                mode="edit"
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
