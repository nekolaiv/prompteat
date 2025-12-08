"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Category, Prompt, FRAMEWORKS, FRAMEWORK_OPTIONS, FrameworkType } from "../../domain/entities";
import { CreatePromptDTO, UpdatePromptDTO } from "../../domain/repositories";
import { ArrowLeft, Info } from "lucide-react";

interface PromptFormEnhancedProps {
  userId?: string;
  categories: Category[];
  onSubmit: (data: CreatePromptDTO | UpdatePromptDTO) => Promise<void>;
  isLoading?: boolean;
  initialData?: Prompt;
  mode?: "create" | "edit";
}

export function PromptFormEnhanced({ userId, categories, onSubmit, isLoading, initialData, mode = "create" }: PromptFormEnhancedProps) {
  const router = useRouter();
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType>(initialData?.framework || "FREEFORM");
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    categoryId: initialData?.categoryId || "",
    visibility: (initialData?.visibility || "private") as "private" | "unlisted" | "public",
    status: (initialData?.status || "draft") as "draft" | "published",
  });
  const [frameworkFields, setFrameworkFields] = useState<Record<string, string>>(initialData?.frameworkData || {});
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData?.frameworkData) {
      setFrameworkFields(initialData.frameworkData);
    }
  }, [initialData]);

  const currentFramework = FRAMEWORKS[selectedFramework];

  const handleFrameworkChange = (framework: FrameworkType) => {
    setSelectedFramework(framework);
    setFrameworkFields({});
  };

  const handleFieldChange = (key: string, value: string) => {
    setFrameworkFields((prev) => ({ ...prev, [key]: value }));
  };

  const generatePromptContent = (): string => {
    if (selectedFramework === "FREEFORM") {
      return frameworkFields.content || "";
    }

    const parts: string[] = [];
    currentFramework.fields.forEach((field) => {
      const value = frameworkFields[field.key];
      if (value && value.trim()) {
        parts.push(`**${field.label}:**\n${value.trim()}`);
      }
    });

    return parts.join("\n\n");
  };

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    const missingFields = currentFramework.fields
      .filter((field) => field.required && !frameworkFields[field.key]?.trim())
      .map((field) => field.label);

    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(", ")}`);
      return;
    }

    const content = generatePromptContent();

    if (!content.trim()) {
      setError("Prompt content cannot be empty");
      return;
    }

    try {
      const promptData = {
        title: formData.title,
        description: formData.description || undefined,
        content,
        categoryId: formData.categoryId || undefined,
        visibility: formData.visibility,
        status: publishNow ? "published" as const : formData.status,
      };

      if (mode === "edit") {
        await onSubmit(promptData);
      } else {
        await onSubmit({
          ...promptData,
          userId: userId!,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save prompt");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{mode === "edit" ? "Edit Prompt" : "Create New Prompt"}</h2>
          <p className="text-sm text-muted-foreground">Use a framework to structure your prompt professionally</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                rows={2}
              />
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
          </CardContent>
        </Card>

        {/* Framework Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Prompt Framework</CardTitle>
            <CardDescription>Choose a framework to structure your prompt using industry-standard patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="framework">Framework Type</Label>
              <Select value={selectedFramework} onValueChange={(value) => handleFrameworkChange(value as FrameworkType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRAMEWORK_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-muted rounded-lg flex gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">{currentFramework.name}</p>
                <p>{currentFramework.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Framework Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Prompt Content</CardTitle>
            <CardDescription>Fill in the framework fields to build your structured prompt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentFramework.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                <p className="text-xs text-muted-foreground">{field.description}</p>
                <Textarea
                  id={field.key}
                  value={frameworkFields[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  maxLength={field.maxLength}
                  rows={field.key === "content" ? 10 : 4}
                  className="font-mono text-sm"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{field.required ? "Required" : "Optional"}</span>
                  <span>{frameworkFields[field.key]?.length || 0} / {field.maxLength}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? "Saving..." : mode === "edit" ? "Update Draft" : "Save as Draft"}
          </Button>
          <Button
            type="button"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={(e) => handleSubmit(e as any, true)}
          >
            {mode === "edit" ? "Update & Publish" : "Publish"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
