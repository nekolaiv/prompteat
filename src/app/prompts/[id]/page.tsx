"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Prompt } from "@/modules/prompts/domain/entities";
import { createClientComponentClient } from "@/shared/config/supabase-client";
import { SupabasePromptDataSource } from "@/modules/prompts/data/sources";
import { PromptRepository } from "@/modules/prompts/data/repositories";
import { Eye, Copy, Heart, ArrowLeft, Share2, Trash2 } from "lucide-react";
import { useAuthContext } from "@/modules/auth/presentation/components";
import { usePrompt } from "@/modules/prompts/presentation/hooks/usePrompt";

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deletePrompt, isLoading: deleting } = usePrompt();

  useEffect(() => {
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

        setPrompt(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch prompt");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPrompt();
    }
  }, [params.id]);

  const handleCopy = async () => {
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);

      // Increment copy count
      const supabase = createClientComponentClient();
      const dataSource = new SupabasePromptDataSource(supabase);
      const repository = new PromptRepository(dataSource);
      await repository.incrementCopyCount(prompt.id);

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDelete = async () => {
    if (!prompt) return;

    const confirmed = await deletePrompt(prompt.id);
    if (confirmed) {
      router.push("/dashboard/prompts");
    }
  };

  if (isLoading) {
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
            <h1 className="text-2xl font-bold mb-4">Prompt Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "This prompt doesn't exist or has been removed."}</p>
            <Button onClick={() => router.push("/prompts")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Prompts
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{prompt.title}</CardTitle>
                  {prompt.description && (
                    <CardDescription className="text-base">{prompt.description}</CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{prompt.viewCount} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Copy className="h-4 w-4" />
                  <span>{prompt.copyCount} copies</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{prompt.favoriteCount} favorites</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Prompt Content</h3>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap font-mono">
                    {prompt.content}
                  </pre>
                  {copied && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                      Copied!
                    </div>
                  )}
                </div>
              </div>

              {prompt.variables && prompt.variables.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Variables</h3>
                  <div className="space-y-2">
                    {prompt.variables.map((variable, index) => (
                      <div key={index} className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                            {`{{${variable.name}}}`}
                          </code>
                          <span className="text-sm text-muted-foreground">
                            {variable.description}
                          </span>
                          {variable.required && (
                            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        {variable.defaultValue && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Default: {variable.defaultValue}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCopy} className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copied!" : "Copy Prompt"}
                </Button>
                {user && user.id === prompt.userId && (
                  <>
                    <Button variant="outline" onClick={() => router.push(`/prompts/${prompt.id}/edit`)}>
                      Edit
                    </Button>
                    {!showDeleteConfirm ? (
                      <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={deleting}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                        {deleting ? "Deleting..." : "Confirm Delete"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
