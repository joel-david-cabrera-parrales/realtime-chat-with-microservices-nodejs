import { InvalidParticipantStatusException } from "../exceptions/invalid-participant-status.exception";

export enum ParticipantStatus {
  active = "active",
  left = "left",
}

const VALID_STATUSES = new Set<string>(Object.values(ParticipantStatus));

export class ParticipantStatusValue {
  private constructor(private readonly status: ParticipantStatus) {}

  public static create(value: string): ParticipantStatusValue {
    if (!VALID_STATUSES.has(value)) {
      throw new InvalidParticipantStatusException(value);
    }

    return new ParticipantStatusValue(value as ParticipantStatus);
  }

  public static active(): ParticipantStatusValue {
    return new ParticipantStatusValue(ParticipantStatus.active);
  }

  public static left(): ParticipantStatusValue {
    return new ParticipantStatusValue(ParticipantStatus.left);
  }

  public get value(): ParticipantStatus {
    return this.status;
  }

  public isActive(): boolean {
    return this.status === ParticipantStatus.active;
  }

  public equals(other: ParticipantStatusValue): boolean {
    return this.status === other.value;
  }

  public toString(): string {
    return this.status;
  }
}
