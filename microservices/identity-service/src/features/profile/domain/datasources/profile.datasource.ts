import { Profile } from "../aggregates/profile.aggregate";

export interface ProfileDataSource {
  save(profile: Profile): Promise<void>;
  findById(id: string): Promise<Profile | null>;
  existsById(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Profile[]>;
}
