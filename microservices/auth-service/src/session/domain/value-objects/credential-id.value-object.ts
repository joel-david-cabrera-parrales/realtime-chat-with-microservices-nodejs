import { InvalidCredentialIdException } from "../exceptions/invalid-credential-id.exception";

export class CredentialId {
  private constructor(private readonly id: number) {}

  public static create(value: number): CredentialId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidCredentialIdException();
    }

    return new CredentialId(value);
  }

  public static new(): CredentialId {
    return new CredentialId(0);
  }

  public get value(): number {
    return this.id;
  }

  public equals(other: CredentialId): boolean {
    return this.id === other.value;
  }

  public toString(): string {
    return String(this.id);
  }
}
