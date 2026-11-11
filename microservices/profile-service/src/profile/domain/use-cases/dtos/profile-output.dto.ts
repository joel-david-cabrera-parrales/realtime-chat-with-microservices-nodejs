export interface ProfileOutput {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
