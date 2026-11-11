import { InvalidAvatarUrlException } from "../exceptions/invalid-avatar-url.exception";

export class AvatarUrl {
  private constructor(private readonly url: string) {}

  public static create(value: string): AvatarUrl {
    const normalized = value.trim();

    let parsed: URL;

    try {
      parsed = new URL(normalized);
    } catch {
      throw new InvalidAvatarUrlException(value);
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new InvalidAvatarUrlException(value);
    }

    return new AvatarUrl(parsed.toString());
  }

  public get value(): string {
    return this.url;
  }

  public equals(other: AvatarUrl): boolean {
    return this.url === other.value;
  }

  public toString(): string {
    return this.url;
  }
}
