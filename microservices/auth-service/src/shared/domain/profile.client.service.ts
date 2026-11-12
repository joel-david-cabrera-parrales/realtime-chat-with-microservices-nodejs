export interface ProfileCreationData {
  fullName: string;
  email: string;
  phone?: string | undefined;
  birthDate?: string | undefined;
  gender?: string | undefined;
}

export interface ProfileData {
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

export abstract class ProfileClientService {
  public abstract createProfile(data: ProfileCreationData): Promise<ProfileData>;
  public abstract deleteProfile(profileCode: string): Promise<void>;
}
