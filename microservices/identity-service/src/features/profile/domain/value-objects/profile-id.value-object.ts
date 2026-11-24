export class ProfileId {
  private constructor(private readonly id: string) {}

  public static generate(): ProfileId {
    // Generate a UUID v4
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return new ProfileId(uuid);
  }

  public static create(value: string): ProfileId {
    return new ProfileId(value);
  }

  public get value(): string {
    return this.id;
  }

  public equals(other: ProfileId): boolean {
    return this.id === other.value;
  }
}