"use client";

import { AuthCard } from "@/modules/auth/presentation/components";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Check your email"
      description="We've sent you a verification link"
    >
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Please check your email and click the verification link to activate your account.
          </p>
          <p className="text-sm text-muted-foreground">
            Can't find the email? Check your spam folder.
          </p>
        </div>

        <div className="pt-4 text-center">
          <Link
            href="/auth/signin"
            className="text-sm font-medium text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
