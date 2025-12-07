"use client";

import { useState } from "react";
import { User, UserSession } from "../../domain/entities";
import { SignInUseCase, SignUpUseCase, SignOutUseCase } from "../../domain/usecases";

/**
 * Authentication hook for presentation layer
 * Provides auth state and actions to components
 */
export function useAuth(
  signInUseCase: SignInUseCase,
  signUpUseCase: SignUpUseCase,
  signOutUseCase: SignOutUseCase
) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await signInUseCase.execute(email, password);
      setUser(session.user);
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sign in failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await signUpUseCase.execute(email, password, name);
      setUser(session.user);
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sign up failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signOutUseCase.execute();
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sign out failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
  };
}
