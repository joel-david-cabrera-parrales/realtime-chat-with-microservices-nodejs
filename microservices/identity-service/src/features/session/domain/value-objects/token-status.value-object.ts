import { InvalidTokenStatusException } from "../exceptions/invalid-token-status.exception";

export enum TokenStatus {
  active = "active",
  expired = "expired",
  revoked = "revoked",
}

const VALID_STATUSES = new Set<string>(Object.values(TokenStatus));

export class TokenStatusValue {
  private constructor(private readonly status: TokenStatus) {}

  public static create(value: string): TokenStatusValue {
    if (!VALID_STATUSES.has(value)) {
      throw new InvalidTokenStatusException(value);
    }

    return new TokenStatusValue(value as TokenStatus);
  }

  public static active(): TokenStatusValue {
    return new TokenStatusValue(TokenStatus.active);
  }

  public get value(): TokenStatus {
    return this.status;
  }

  public isActive(): boolean {
    return this.status === TokenStatus.active;
  }

  public isRevoked(): boolean {
    return this.status === TokenStatus.revoked;
  }

  public equals(other: TokenStatusValue): boolean {
    return this.status === other.value;
  }

  public toString(): string {
    return this.status;
  }
}
