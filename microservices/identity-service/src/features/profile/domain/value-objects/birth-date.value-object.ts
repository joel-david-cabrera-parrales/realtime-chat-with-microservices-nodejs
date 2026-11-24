export class BirthDate {
  private constructor(private readonly birthDate: string) {}

  public static create(value: string): BirthDate | undefined {
    if (!value) {
      return undefined;
    }
    // Validate ISO date format
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error("La fecha de nacimiento debe tener formato ISO 8601");
    }
    return new BirthDate(value);
  }

  public get value(): string {
    return this.birthDate;
  }

  public equals(other: BirthDate): boolean {
    return this.birthDate === other.value;
  }
}
