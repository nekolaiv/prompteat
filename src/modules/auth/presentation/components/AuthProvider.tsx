"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../../domain/entities";
import { createClientComponentClient } from "@/shared/config/supabase-client";
import { SupabaseAuthDataSource } from "../../data/sources";
import { AuthRepository } from "../../data/repositories";
import { SignOutUseCase } from "../../domain/usecases";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider component - manages global auth state
 * Listens to Supabase auth changes and syncs user state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClientComponentClient();
    const authDataSource = new SupabaseAuthDataSource(supabase);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || null,
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || null,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClientComponentClient();
    const authDataSource = new SupabaseAuthDataSource(supabase);
    const authRepository = new AuthRepository(authDataSource);
    const signOutUseCase = new SignOutUseCase(authRepository);

    await signOutUseCase.execute();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
