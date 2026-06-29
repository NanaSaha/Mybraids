export type UserRole = 'client' | 'provider' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  phone: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}
