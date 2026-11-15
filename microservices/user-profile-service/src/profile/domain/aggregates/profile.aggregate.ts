import { AvatarFileCode } from "../value-objects/avatar-file-code.value-object";
import { Bio } from "../value-objects/bio.value-object";
import { BirthDate } from "../value-objects/birth-date.value-object";
import { Email } from "../value-objects/email.value-object";
import { FullName } from "../value-objects/full-name.value-object";
import { Gender } from "../value-objects/gender.value-object";
import { Phone } from "../value-objects/phone.value-object";
import { ProfileId } from "../value-objects/profile-id.value-object";
import { CreateProfileProps, ProfilePrimitives, ProfileProps, RehydrateProfileProps, UpdateProfileProps } from "../interfaces/profile.interface";

export class Profile {
  private constructor(private readonly props: ProfileProps) {}

  public static create(props: CreateProfileProps): Profile {
    const now = new Date();

    return new Profile({
      id: ProfileId.generate(),
      fullName: FullName.create(props.fullName),
      email: Email.create(props.email),
      phone: props.phone === undefined ? undefined : Phone.create(props.phone),
      birthDate: props.birthDate === undefined ? undefined : BirthDate.create(props.birthDate),
      gender: props.gender === undefined ? undefined : Gender.create(props.gender),
      bio: props.bio === undefined ? undefined : Bio.create(props.bio),
      avatarFileCode: undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static rehydrate(props: RehydrateProfileProps): Profile {
    return new Profile({
      id: ProfileId.create(props.id),
      fullName: FullName.create(props.fullName),
      email: Email.create(props.email),
      phone: props.phone === null ? undefined : Phone.create(props.phone),
      birthDate: props.birthDate === null ? undefined : BirthDate.create(props.birthDate),
      gender: props.gender === null ? undefined : Gender.create(props.gender),
      bio: props.bio === null ? undefined : Bio.create(props.bio),
      avatarFileCode: props.avatarFileCode === null ? undefined : AvatarFileCode.create(props.avatarFileCode),
      createdAt: new Date(props.createdAt.getTime()),
      updatedAt: new Date(props.updatedAt.getTime()),
    });
  }

  public get id(): ProfileId {
    return this.props.id;
  }

  public get fullName(): FullName {
    return this.props.fullName;
  }

  public get email(): Email {
    return this.props.email;
  }

  public get phone(): Phone | undefined {
    return this.props.phone;
  }

  public get birthDate(): BirthDate | undefined {
    return this.props.birthDate;
  }

  public get gender(): Gender | undefined {
    return this.props.gender;
  }

  public get bio(): Bio | undefined {
    return this.props.bio;
  }

  public get avatarFileCode(): AvatarFileCode | undefined {
    return this.props.avatarFileCode;
  }

  public get createdAt(): Date {
    return new Date(this.props.createdAt.getTime());
  }

  public get updatedAt(): Date {
    return new Date(this.props.updatedAt.getTime());
  }

  public update(changes: UpdateProfileProps): void {
    if (changes.fullName !== undefined) {
      this.props.fullName = FullName.create(changes.fullName);
    }

    if (changes.phone !== undefined) {
      this.props.phone = changes.phone === null ? undefined : Phone.create(changes.phone);
    }

    if (changes.birthDate !== undefined) {
      this.props.birthDate = changes.birthDate === null ? undefined : BirthDate.create(changes.birthDate);
    }

    if (changes.gender !== undefined) {
      this.props.gender = changes.gender === null ? undefined : Gender.create(changes.gender);
    }

    if (changes.bio !== undefined) {
      this.props.bio = changes.bio === null ? undefined : Bio.create(changes.bio);
    }

    this.props.updatedAt = new Date();
  }

  public assignAvatarFileCode(fileCode: string): void {
    this.props.avatarFileCode = AvatarFileCode.create(fileCode);
    this.props.updatedAt = new Date();
  }

  public equals(other: Profile): boolean {
    return this.props.id.equals(other.id);
  }

  public toPrimitives(): ProfilePrimitives {
    return {
      id: this.props.id.value,
      fullName: this.props.fullName.value,
      email: this.props.email.value,
      phone: this.props.phone?.value ?? null,
      birthDate: this.props.birthDate?.toISOString() ?? null,
      gender: this.props.gender?.value ?? null,
      bio: this.props.bio?.value ?? null,
      avatarFileCode: this.props.avatarFileCode?.value ?? null,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
