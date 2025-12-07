"use client";

import { useState } from "react";
import { FormInput } from "./FormInput";
import { AuthButton } from "./AuthButton";
import Link from "next/link";

interface SignUpFormProps {
  onSubmit: (data: SignUpData) => Promise<void>;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [formData, setFormData] = useState<SignUpData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<SignUpData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setIsLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md">
          {serverError}
        </div>
      )}

      <FormInput
        id="username"
        label="Username"
        value={formData.username}
        onChange={(value) => setFormData({ ...formData, username: value })}
        error={errors.username}
        placeholder="johndoe"
        required
      />

      <FormInput
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => setFormData({ ...formData, email: value })}
        error={errors.email}
        placeholder="john@example.com"
        required
      />

      <FormInput
        id="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={(value) => setFormData({ ...formData, password: value })}
        error={errors.password}
        placeholder="••••••••"
        required
      />

      <FormInput
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
        error={errors.confirmPassword}
        placeholder="••••••••"
        required
      />

      <AuthButton type="submit" isLoading={isLoading}>
        Create Account
      </AuthButton>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
