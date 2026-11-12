import { InvalidSessionStatusException } from "../exceptions/invalid-session-status.exception";

export enum SessionStatus {
  active = "active",
  expired = "expired",
  revoked = "revoked",
}

const VALID_STATUSES = new Set<string>(Object.values(SessionStatus));

export class SessionStatusValue {
  private constructor(private readonly status: SessionStatus) {}

  public static create(value: string): SessionStatusValue {
    if (!VALID_STATUSES.has(value)) {
      throw new InvalidSessionStatusException(value);
    }

    return new SessionStatusValue(value as SessionStatus);
  }

  public static active(): SessionStatusValue {
    return new SessionStatusValue(SessionStatus.active);
  }

  public get value(): SessionStatus {
    return this.status;
  }

  public isActive(): boolean {
    return this.status === SessionStatus.active;
  }

  public equals(other: SessionStatusValue): boolean {
    return this.status === other.value;
  }

  public toString(): string {
    return this.status;
  }
}
