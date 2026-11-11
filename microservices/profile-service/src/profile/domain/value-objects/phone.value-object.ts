import { InvalidPhoneException } from "../exceptions/invalid-phone.exception";

const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;

export class Phone {
  private constructor(private readonly phone: string) {}

  public static create(value: string): Phone {
    const normalized = value.replace(/[\s()-]/g, "");

    if (!PHONE_PATTERN.test(normalized)) {
      throw new InvalidPhoneException(value);
    }

    return new Phone(normalized);
  }

  public get value(): string {
    return this.phone;
  }

  public equals(other: Phone): boolean {
    return this.phone === other.value;
  }

  public toString(): string {
    return this.phone;
  }
}
