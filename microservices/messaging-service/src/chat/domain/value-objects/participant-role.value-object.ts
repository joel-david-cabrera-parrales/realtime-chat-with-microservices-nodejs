import { InvalidParticipantRoleException } from "../exceptions/invalid-participant-role.exception";

export enum ParticipantRole {
  admin = "admin",
  member = "member",
}

const VALID_ROLES = new Set<string>(Object.values(ParticipantRole));

export class ParticipantRoleValue {
  private constructor(private readonly role: ParticipantRole) {}

  public static create(value: string): ParticipantRoleValue {
    if (!VALID_ROLES.has(value)) {
      throw new InvalidParticipantRoleException(value);
    }

    return new ParticipantRoleValue(value as ParticipantRole);
  }

  public static admin(): ParticipantRoleValue {
    return new ParticipantRoleValue(ParticipantRole.admin);
  }

  public static member(): ParticipantRoleValue {
    return new ParticipantRoleValue(ParticipantRole.member);
  }

  public get value(): ParticipantRole {
    return this.role;
  }

  public isAdmin(): boolean {
    return this.role === ParticipantRole.admin;
  }

  public equals(other: ParticipantRoleValue): boolean {
    return this.role === other.value;
  }

  public toString(): string {
    return this.role;
  }
}
