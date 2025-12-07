"use client";

import { useState } from "react";
import { FormInput } from "./FormInput";
import { AuthButton } from "./AuthButton";
import Link from "next/link";

interface ForgotPasswordFormProps {
  onRequestReset: (email: string) => Promise<void>;
}

export function ForgotPasswordForm({ onRequestReset }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      await onRequestReset(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 rounded-md">
          Password reset link sent! Check your email.
        </div>
      )}

      <FormInput
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="john@example.com"
        required
      />

      <AuthButton type="submit" isLoading={isLoading}>
        Send Reset Link
      </AuthButton>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/auth/signin" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
