"use client";

import { AuthCard, ForgotPasswordForm } from "@/modules/auth/presentation/components";
import { ForgotPasswordUseCase } from "@/modules/auth/domain/usecases";
import { AuthRepository } from "@/modules/auth/data/repositories";
import { SupabaseAuthDataSource } from "@/modules/auth/data/sources";
import { createClientComponentClient } from "@/shared/config/supabase-client";

export default function ForgotPasswordPage() {
  const supabase = createClientComponentClient();
  const authDataSource = new SupabaseAuthDataSource(supabase);
  const authRepository = new AuthRepository(authDataSource);
  const forgotPasswordUseCase = new ForgotPasswordUseCase(authRepository);

  const handleRequestReset = async (email: string) => {
    await forgotPasswordUseCase.requestReset(email);
  };

  return (
    <AuthCard
      title="Forgot password?"
      description="Enter your email and we'll send you a reset link"
    >
      <ForgotPasswordForm onRequestReset={handleRequestReset} />
    </AuthCard>
  );
}
