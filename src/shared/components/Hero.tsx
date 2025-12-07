"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Search, FolderHeart } from "lucide-react";

export function Hero() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Your Personal
            <span className="text-primary"> Prompt Library</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, organize, and share your AI prompts. Build a library of reusable templates
            for better productivity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/signup">Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-4xl w-full">
          <FeatureCard
            icon={<Sparkles className="h-8 w-8 text-primary" />}
            title="Build Templates"
            description="Create reusable prompt templates with dynamic variables"
          />
          <FeatureCard
            icon={<FolderHeart className="h-8 w-8 text-primary" />}
            title="Organize"
            description="Save and categorize your prompts in collections"
          />
          <FeatureCard
            icon={<Search className="h-8 w-8 text-primary" />}
            title="Discover"
            description="Explore and fork prompts shared by the community"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center space-y-3 p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="rounded-full bg-primary/10 p-3">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </div>
  );
}
