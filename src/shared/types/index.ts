/**
 * Shared types used across all modules
 */

export type UUID = string;
export type Timestamp = string;

export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}
