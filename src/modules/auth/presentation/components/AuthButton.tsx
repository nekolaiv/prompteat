"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AuthButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "default" | "outline" | "ghost";
}

export function AuthButton({
  children,
  isLoading = false,
  disabled = false,
  onClick,
  type = "button",
  variant = "default",
}: AuthButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full"
      variant={variant}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
