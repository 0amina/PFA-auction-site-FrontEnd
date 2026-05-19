export interface User {
  id: string;
  email: string;
  createdAt: Date;
  wallet_address?: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
}
