"use client";

import { Header } from "@/shared/components";
import { useAuthContext } from "@/modules/auth/presentation/components";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Folder, Heart, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { usePrompts } from "@/modules/prompts/presentation/hooks/usePrompts";
import { PromptCard } from "@/modules/prompts/presentation/components/PromptCard";

export default function DashboardPage() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();
  const { prompts, isLoading: promptsLoading } = usePrompts(user?.id);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user.name || "User"}!</h1>
              <p className="text-muted-foreground mt-1">Manage your prompts and collections</p>
            </div>
            <Button size="lg" asChild>
              <Link href="/prompts/new">
                <Plus className="mr-2 h-5 w-5" />
                New Prompt
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              icon={<FileText className="h-6 w-6 text-blue-500" />}
              title="Total Prompts"
              value={prompts.length.toString()}
              description={prompts.length === 0 ? "Create your first prompt" : "Your prompts"}
            />
            <StatsCard
              icon={<Folder className="h-6 w-6 text-green-500" />}
              title="Collections"
              value="0"
              description="Organize with collections"
            />
            <StatsCard
              icon={<Heart className="h-6 w-6 text-red-500" />}
              title="Favorites"
              value="0"
              description="Save your favorites"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Prompts</CardTitle>
              <CardDescription>Your recently created prompts will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              {promptsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : prompts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No prompts yet</p>
                  <Button asChild>
                    <Link href="/prompts/new">Create Your First Prompt</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prompts.slice(0, 6).map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatsCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
