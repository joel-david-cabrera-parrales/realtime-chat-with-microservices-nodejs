import { createHash } from "node:crypto";
import { CredentialCode } from "./credential-code.value-object";
import { InvalidDirectKeyException } from "../exceptions/invalid-direct-key.exception";

const SHA256_PATTERN = /^[0-9a-f]{64}$/;

export class DirectKey {
  private constructor(private readonly key: string) {}

  public static create(value: string): DirectKey {
    const normalized = value.trim().toLowerCase();

    if (!SHA256_PATTERN.test(normalized)) {
      throw new InvalidDirectKeyException(value);
    }

    return new DirectKey(normalized);
  }

  public static fromParticipants(credentialCodes: string[]): DirectKey {
    const normalized = credentialCodes.map((code) => CredentialCode.create(code).value).sort();

    if (normalized.length !== 2 || normalized[0] === normalized[1]) {
      throw new InvalidDirectKeyException(normalized.join(","));
    }

    const key = createHash("sha256").update(normalized.join("|")).digest("hex");

    return new DirectKey(key);
  }

  public get value(): string {
    return this.key;
  }

  public equals(other: DirectKey): boolean {
    return this.key === other.value;
  }

  public toString(): string {
    return this.key;
  }
}
