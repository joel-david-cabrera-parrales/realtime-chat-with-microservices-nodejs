export interface CreateProfileInput {
  fullName: string;
  email: string;
  phone?: string | undefined;
  birthDate?: string | undefined;
  gender?: string | undefined;
  bio?: string | undefined;
}
