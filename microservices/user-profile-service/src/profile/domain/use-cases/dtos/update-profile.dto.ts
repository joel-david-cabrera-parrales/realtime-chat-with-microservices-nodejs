export interface UpdateProfileInput {
  id: string;
  fullName?: string;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  bio?: string | null;
}
