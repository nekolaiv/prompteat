"use client";

import { useRouter } from "next/navigation";
import { AuthCard, ResetPasswordForm } from "@/modules/auth/presentation/components";
import { ForgotPasswordUseCase } from "@/modules/auth/domain/usecases";
import { AuthRepository } from "@/modules/auth/data/repositories";
import { SupabaseAuthDataSource } from "@/modules/auth/data/sources";
import { createClientComponentClient } from "@/shared/config/supabase-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const authDataSource = new SupabaseAuthDataSource(supabase);
  const authRepository = new AuthRepository(authDataSource);
  const forgotPasswordUseCase = new ForgotPasswordUseCase(authRepository);

  const handleResetPassword = async (password: string, confirmPassword: string) => {
    await forgotPasswordUseCase.updatePassword(password, confirmPassword);
    router.push("/auth/signin");
  };

  return (
    <AuthCard title="Reset password" description="Enter your new password">
      <ResetPasswordForm onResetPassword={handleResetPassword} />
    </AuthCard>
  );
}
