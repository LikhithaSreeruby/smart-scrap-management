export type UserRole = "user" | "collector" | "admin";

export interface UserProfile {
  uid: string;
  role: UserRole;
  phone: string;
  rating: number;
  total_earned: number;
  displayName?: string;
  photoURL?: string;
  verified?: boolean;
}

export type ScrapStatus = "pending" | "accepted" | "picked" | "paid" | "cancelled";

export interface ScrapItem {
  type: string;
  weight_kg: number;
  photo_url?: string;
  estimated_price: number;
}

export interface ScrapRequest {
  id: string;
  user_id: string;
  items: ScrapItem[];
  total_estimated_price: number;
  status: ScrapStatus;
  collector_id: string | null;
  created_at: number;
  address: string;
  location?: {
    lat: number;
    lng: number;
  };
  otp?: string;
}

export interface ScrapRate {
  type: string;
  unit: string;
  rate: number;
  icon: string;
  co2_saving_per_kg: number; // in kg
}
