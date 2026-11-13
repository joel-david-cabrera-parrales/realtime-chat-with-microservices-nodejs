import { AvatarFileCode } from "../value-objects/avatar-file-code.value-object";
import { Bio } from "../value-objects/bio.value-object";
import { BirthDate } from "../value-objects/birth-date.value-object";
import { Email } from "../value-objects/email.value-object";
import { FullName } from "../value-objects/full-name.value-object";
import { Gender } from "../value-objects/gender.value-object";
import { Phone } from "../value-objects/phone.value-object";
import { ProfileId } from "../value-objects/profile-id.value-object";

export interface ProfileProps {
  id: ProfileId;
  fullName: FullName;
  email: Email;
  phone: Phone | undefined;
  birthDate: BirthDate | undefined;
  gender: Gender | undefined;
  bio: Bio | undefined;
  avatarFileCode: AvatarFileCode | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfileProps {
  fullName: string;
  email: string;
  phone?: string | undefined;
  birthDate?: string | Date | undefined;
  gender?: string | undefined;
  bio?: string | undefined;
}

export interface RehydrateProfileProps {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  bio: string | null;
  avatarFileCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileProps {
  fullName?: string | undefined;
  phone?: string | null | undefined;
  birthDate?: string | Date | null | undefined;
  gender?: string | null | undefined;
  bio?: string | null | undefined;
}

export interface ProfilePrimitives {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  bio: string | null;
  avatarFileCode: string | null;
  createdAt: string;
  updatedAt: string;
}
