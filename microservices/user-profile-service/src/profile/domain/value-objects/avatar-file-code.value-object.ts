import { InvalidAvatarFileCodeException } from "../exceptions/invalid-avatar-file-code.exception";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class AvatarFileCode {
  private constructor(private readonly code: string) {}

  public static create(value: string): AvatarFileCode {
    const normalized = value.trim();

    if (!UUID_PATTERN.test(normalized)) {
      throw new InvalidAvatarFileCodeException(value);
    }

    return new AvatarFileCode(normalized.toLowerCase());
  }

  public get value(): string {
    return this.code;
  }

  public equals(other: AvatarFileCode): boolean {
    return this.code === other.value;
  }

  public toString(): string {
    return this.code;
  }
}
