export class Email {
  private constructor(private readonly email: string) {}

  public static create(value: string): Email {
    const normalized = value.trim().toLowerCase();

    if (!normalized || normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error("Email no tiene un formato válido");
    }

    return new Email(normalized);
  }

  public get value(): string {
    return this.email;
  }

  public equals(other: Email): boolean {
    return this.email === other.value;
  }

  public toString(): string {
    return this.email;
  }
}
