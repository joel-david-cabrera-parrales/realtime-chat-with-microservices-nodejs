export class AvatarFileCode {
  private constructor(private readonly avatarFileCode: string) {}

  public static create(value: string | undefined): AvatarFileCode | undefined {
    if (value === undefined || value === "") {
      return undefined;
    }
    return new AvatarFileCode(value.trim());
  }

  public get value(): string {
    return this.avatarFileCode;
  }

  public equals(other: AvatarFileCode): boolean {
    return this.avatarFileCode === other.value;
  }
}