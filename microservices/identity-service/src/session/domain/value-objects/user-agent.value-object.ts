import { InvalidUserAgentException } from "../exceptions/invalid-user-agent.exception";

const MAX_LENGTH = 512;

export class UserAgent {
  private constructor(private readonly agent: string) {}

  public static create(value: string): UserAgent {
    const normalized = value.trim();

    if (normalized.length === 0 || normalized.length > MAX_LENGTH) {
      throw new InvalidUserAgentException(MAX_LENGTH);
    }

    return new UserAgent(normalized);
  }

  public get value(): string {
    return this.agent;
  }

  public equals(other: UserAgent): boolean {
    return this.agent === other.value;
  }

  public toString(): string {
    return this.agent;
  }
}
