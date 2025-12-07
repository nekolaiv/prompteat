"use client";

import { useRouter } from "next/navigation";
import { AuthCard, SignInForm } from "@/modules/auth/presentation/components";
import { SignInUseCase } from "@/modules/auth/domain/usecases";
import { AuthRepository } from "@/modules/auth/data/repositories";
import { SupabaseAuthDataSource } from "@/modules/auth/data/sources";
import { createClientComponentClient } from "@/shared/config/supabase-client";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const authDataSource = new SupabaseAuthDataSource(supabase);
  const authRepository = new AuthRepository(authDataSource);
  const signInUseCase = new SignInUseCase(authRepository);

  const handleSignIn = async (email: string, password: string) => {
    await signInUseCase.execute(email, password);
    router.push("/dashboard");
  };

  return (
    <AuthCard title="Welcome back" description="Sign in to your account to continue">
      <SignInForm onSubmit={handleSignIn} />
    </AuthCard>
  );
}
