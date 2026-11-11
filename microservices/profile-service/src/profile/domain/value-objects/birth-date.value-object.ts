import { InvalidBirthDateException } from "../exceptions/invalid-birth-date.exception";

const MIN_DATE = new Date(Date.UTC(1900, 0, 1));

export class BirthDate {
  private constructor(private readonly date: Date) {}

  public static create(value: string | Date): BirthDate {
    const date = typeof value === "string" ? new Date(value) : new Date(value.getTime());

    if (Number.isNaN(date.getTime())) {
      throw new InvalidBirthDateException("no es una fecha válida");
    }

    const normalized = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    if (normalized.getTime() > today.getTime()) {
      throw new InvalidBirthDateException("no puede estar en el futuro");
    }

    if (normalized.getTime() < MIN_DATE.getTime()) {
      throw new InvalidBirthDateException("debe ser posterior al 1 de enero de 1900");
    }

    return new BirthDate(normalized);
  }

  public get value(): Date {
    return new Date(this.date.getTime());
  }

  public toISOString(): string {
    return this.date.toISOString().slice(0, 10);
  }

  public equals(other: BirthDate): boolean {
    return this.date.getTime() === other.date.getTime();
  }

  public toString(): string {
    return this.toISOString();
  }
}
