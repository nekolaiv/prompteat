"use client";

import { useRouter } from "next/navigation";
import { AuthCard, SignUpForm, SignUpData } from "@/modules/auth/presentation/components";
import { SignUpUseCase } from "@/modules/auth/domain/usecases";
import { AuthRepository } from "@/modules/auth/data/repositories";
import { SupabaseAuthDataSource } from "@/modules/auth/data/sources";
import { createClientComponentClient } from "@/shared/config/supabase-client";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const authDataSource = new SupabaseAuthDataSource(supabase);
  const authRepository = new AuthRepository(authDataSource);
  const signUpUseCase = new SignUpUseCase(authRepository);

  const handleSignUp = async (data: SignUpData) => {
    await signUpUseCase.execute(
      data.username,
      data.email,
      data.password,
      data.confirmPassword
    );
    router.push("/auth/verify-email");
  };

  return (
    <AuthCard
      title="Create an account"
      description="Enter your details to get started with Prompeat"
    >
      <SignUpForm onSubmit={handleSignUp} />
    </AuthCard>
  );
}
