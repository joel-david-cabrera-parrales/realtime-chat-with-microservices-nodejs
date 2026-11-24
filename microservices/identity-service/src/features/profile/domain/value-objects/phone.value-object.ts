export class Phone {
  private constructor(private readonly phone: string) {}

  public static create(value: string | undefined): Phone | undefined {
    if (value === undefined || value === "") {
      return undefined;
    }
    return new Phone(value.trim());
  }

  public get value(): string {
    return this.phone;
  }

  public equals(other: Phone): boolean {
    return this.phone === other.value;
  }
}
