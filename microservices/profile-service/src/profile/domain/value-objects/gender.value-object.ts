import { InvalidGenderException } from "../exceptions/invalid-gender.exception";

export const GENDER_VALUES = [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
] as const;

export type GenderValue = (typeof GENDER_VALUES)[number];

export class Gender {
  private constructor(private readonly gender: GenderValue) {}

  public static create(value: string): Gender {
    const normalized = value.trim().toLowerCase();

    if (!GENDER_VALUES.includes(normalized as GenderValue)) {
      throw new InvalidGenderException(value, GENDER_VALUES);
    }

    return new Gender(normalized as GenderValue);
  }

  public get value(): GenderValue {
    return this.gender;
  }

  public equals(other: Gender): boolean {
    return this.gender === other.value;
  }

  public toString(): string {
    return this.gender;
  }
}
