/**
 * Shared type definitions for Bio-Sada application.
 * All types mirror the Supabase database schema.
 */

// ── Enums ────────────────────────────────────────────────────

export type UserRole = 'admin' | 'partners' | 'customers';
export type RequestStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

// ── Table Types ──────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  username: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_verified: boolean;
}

export interface Address {
  id: string;
  profile_id: string;
  label: string;
  address_detail: string;
  city: string;
  province: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  is_primary: boolean;
}

export interface WasteCategory {
  id: string;
  name: string;
  price_per_kg: number;
  unit: string;
  description: string | null;
  image_url: string | null;
  status: 'active' | 'inactive';
}

export interface PickupRequest {
  id: string;
  customers_id: string;
  partners_id: string | null;
  address_id: string;
  total_weight: number | null;
  total_price: number | null;
  pickup_date: string;
  pickup_time: string;
  waste_photo_url: string | null;
  status: RequestStatus;
  notes: string | null;
  accepted_at: string | null;
  completed_at: string | null;
  created_at?: string;
}

export interface PickupRequestItem {
  id: string;
  request_id: string;
  category_id: string;
  estimated_weight: number;
  real_weight: number | null;
  price_at_time: number;
  subtotal: number;
  /** Joined fields (optional, from query) */
  waste_categories?: Pick<WasteCategory, 'name' | 'unit'>;
}

// ── Form/UI Types ────────────────────────────────────────────

/** A single waste item row in the deposit request form */
export interface DepositFormItem {
  categoryId: string;
  categoryName: string;
  estimatedWeight: number;
  pricePerKg: number;
  subtotal: number;
}

/** Customer stats aggregated from completed pickup requests */
export interface CustomerStats {
  totalWeight: number;
  totalEarnings: number;
  totalTransactions: number;
}
