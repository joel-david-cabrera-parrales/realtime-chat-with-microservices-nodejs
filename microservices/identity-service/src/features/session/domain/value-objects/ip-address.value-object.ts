import { InvalidIpAddressException } from "../exceptions/invalid-ip-address.exception";

const MAX_LENGTH = 45;

export class IpAddress {
  private constructor(private readonly address: string) {}

  public static create(value: string): IpAddress {
    const normalized = value.trim();

    if (normalized.length === 0 || normalized.length > MAX_LENGTH) {
      throw new InvalidIpAddressException();
    }

    return new IpAddress(normalized);
  }

  public get value(): string {
    return this.address;
  }

  public equals(other: IpAddress): boolean {
    return this.address === other.value;
  }

  public toString(): string {
    return this.address;
  }
}
