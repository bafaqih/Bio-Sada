/**
 * Shared type definitions for Bio-Sada application.
 * Role values match the `user_role` enum in the database.
 */

export type UserRole = 'admin' | 'partners' | 'customers';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  is_verified: boolean;
  phone_number: string | null;
  avatar_url: string | null;
}
