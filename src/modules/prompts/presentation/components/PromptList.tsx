"use client";

import { Prompt } from "../../domain/entities";
import { PromptCard } from "./PromptCard";

interface PromptListProps {
  prompts: Prompt[];
  emptyMessage?: string;
}

export function PromptList({ prompts, emptyMessage = "No prompts found" }: PromptListProps) {
  if (prompts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
