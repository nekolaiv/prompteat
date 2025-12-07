import { UUID, Timestamp } from "@/shared/types";

/**
 * User entity - Domain model for authentication module
 */
export interface User {
  id: UUID;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * User session entity
 */
export interface UserSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Timestamp;
}
