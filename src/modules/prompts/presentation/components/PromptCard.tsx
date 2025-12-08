"use client";

import { Prompt } from "../../domain/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Copy, Heart } from "lucide-react";
import Link from "next/link";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  return (
    <Link href={`/prompts/${prompt.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="line-clamp-1">{prompt.title}</CardTitle>
          {prompt.description && (
            <CardDescription className="line-clamp-2">{prompt.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{prompt.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Copy className="h-4 w-4" />
              <span>{prompt.copyCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{prompt.favoriteCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
