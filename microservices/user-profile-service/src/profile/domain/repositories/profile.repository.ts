import { Profile } from "../aggregates/profile.aggregate";
import { Email } from "../value-objects/email.value-object";
import { ProfileId } from "../value-objects/profile-id.value-object";

export abstract class ProfileRepository {
  abstract save(profile: Profile): Promise<void>;
  abstract findById(id: ProfileId): Promise<Profile | null>;
  abstract existsById(id: ProfileId): Promise<boolean>;
  abstract existsByEmail(email: Email): Promise<boolean>;
  abstract delete(id: ProfileId): Promise<void>;
}
