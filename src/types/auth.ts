import type { Role } from './role';

export interface AuthUser {
  id:                   string;
  first_name:           string;
  last_name:            string;
  email:                string;
  role:                 Role;
  balance?:             number;
  // Backend stores the Solana wallet as `phantom_wallet_address`; we expose it
  // as `wallet_address` for the UI and keep the original for round-tripping.
  wallet_address?:         string | null;
  phantom_wallet_address?: string | null;
  shipping_address?:    string;
  profile_picture_url?: string;
  email_verified:       boolean;
}

export interface AuthState {
  user:        AuthUser | null;
  accessToken: string   | null;
  isLoading:   boolean;          // true while rehydrating from localStorage
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name:  string;
  email:      string;
  password:   string;
}