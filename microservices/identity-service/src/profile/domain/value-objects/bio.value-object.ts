export class Bio {
  private constructor(private readonly bio: string) {}

  public static create(value: string | undefined): Bio | undefined {
    if (value === undefined || value === "") {
      return undefined;
    }
    return new Bio(value.trim());
  }

  public get value(): string {
    return this.bio;
  }

  public equals(other: Bio): boolean {
    return this.bio === other.value;
  }
}