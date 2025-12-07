import { User } from "../../domain/entities";

/**
 * User model - Maps between database schema and domain entity
 */
export interface UserModel {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Converts database model to domain entity
 */
export function toDomainUser(model: UserModel): User {
  return {
    id: model.id,
    email: model.email,
    name: model.name,
    avatarUrl: model.avatar_url,
    createdAt: model.created_at,
    updatedAt: model.updated_at,
  };
}

/**
 * Converts domain entity to database model
 */
export function toUserModel(user: User): UserModel {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatarUrl,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}
