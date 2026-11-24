import { Profile } from "../aggregates/profile.aggregate";

export abstract class ProfileRepository {
  public abstract save(profile: Profile): Promise<void>;
  public abstract findById(id: string): Promise<Profile | null>;
  public abstract existsById(id: string): Promise<boolean>;
  public abstract existsByEmail(email: string): Promise<boolean>;
  public abstract findByUsername(username: string): Promise<Profile | null>;
  public abstract delete(id: string): Promise<void>;
  public abstract findAll(): Promise<Profile[]>;
}
