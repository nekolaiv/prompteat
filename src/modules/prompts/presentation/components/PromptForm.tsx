"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category, Prompt } from "../../domain/entities";
import { CreatePromptDTO, UpdatePromptDTO } from "../../domain/repositories";

interface PromptFormProps {
  userId?: string;
  categories: Category[];
  onSubmit: (data: CreatePromptDTO | UpdatePromptDTO) => Promise<void>;
  isLoading?: boolean;
  initialData?: Prompt;
  mode?: "create" | "edit";
}

export function PromptForm({ userId, categories, onSubmit, isLoading, initialData, mode = "create" }: PromptFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    categoryId: initialData?.categoryId || "",
    visibility: (initialData?.visibility || "private") as "private" | "unlisted" | "public",
    status: (initialData?.status === "archived" ? "draft" : initialData?.status || "draft") as "draft" | "published",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        content: initialData.content,
        categoryId: initialData.categoryId || "",
        visibility: initialData.visibility,
        status: initialData.status === "archived" ? "draft" : initialData.status,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "edit") {
        await onSubmit({
          title: formData.title,
          description: formData.description || undefined,
          content: formData.content,
          categoryId: formData.categoryId || undefined,
          visibility: formData.visibility,
          status: formData.status,
        });
      } else {
        await onSubmit({
          userId: userId!,
          title: formData.title,
          description: formData.description || undefined,
          content: formData.content,
          categoryId: formData.categoryId || undefined,
          visibility: formData.visibility,
          status: formData.status,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save prompt");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter prompt title"
          required
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of your prompt"
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Prompt Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your prompt here... Use {{variable}} for dynamic fields"
          required
          rows={8}
          maxLength={10000}
        />
        <p className="text-xs text-muted-foreground">
          Tip: Use {"{{"} and {"}}"}  to create variables (e.g., &quot;Write about {"{{topic}}"}&quot;)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            value={formData.visibility}
            onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="unlisted">Unlisted</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : mode === "edit" ? "Update Draft" : "Save as Draft"}
        </Button>
        <Button
          type="button"
          variant="default"
          disabled={isLoading}
          onClick={() => {
            setFormData({ ...formData, status: "published" });
            handleSubmit(new Event("submit") as any);
          }}
        >
          {mode === "edit" ? "Update & Publish" : "Publish"}
        </Button>
      </div>
    </form>
  );
}
