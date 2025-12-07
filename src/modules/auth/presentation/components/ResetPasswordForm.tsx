"use client";

import { useState } from "react";
import { FormInput } from "./FormInput";
import { AuthButton } from "./AuthButton";

interface ResetPasswordFormProps {
  onResetPassword: (password: string, confirmPassword: string) => Promise<void>;
}

export function ResetPasswordForm({ onResetPassword }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onResetPassword(password, confirmPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
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

      <FormInput
        id="password"
        label="New Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        required
      />

      <FormInput
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="••••••••"
        required
      />

      <AuthButton type="submit" isLoading={isLoading}>
        Reset Password
      </AuthButton>
    </form>
  );
}
