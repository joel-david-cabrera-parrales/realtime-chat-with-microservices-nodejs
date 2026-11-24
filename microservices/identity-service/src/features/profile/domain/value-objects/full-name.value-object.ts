export class FullName {
  private constructor(private readonly fullName: string) {}

  public static create(value: string): FullName {
    if (!value || value.trim().length < 2) {
      throw new Error("El nombre completo debe tener al menos 2 caracteres");
    }
    return new FullName(value.trim());
  }

  public get value(): string {
    return this.fullName;
  }

  public equals(other: FullName): boolean {
    return this.fullName === other.value;
  }
}
