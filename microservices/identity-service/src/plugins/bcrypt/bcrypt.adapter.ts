import bcrypt from "bcrypt";
import { createHash } from "node:crypto";
import { HashService } from "../../shared/domain/services/hash.service";

export class BcryptAdapter extends HashService {
  constructor(private readonly saltRounds: number = 10) {
    super();
  }

  public verifyHash(hash: string, textPlain: string): Promise<boolean> {
    return bcrypt.compare(textPlain, hash);
  }

  public hash(textPlain: string): Promise<string> {
    return bcrypt.hash(textPlain, this.saltRounds);
  }

  public hashToken(textPlain: string): Promise<string> {
    return bcrypt.hash(this.sha256(textPlain), this.saltRounds);
  }

  public verifyTokenHash(hash: string, textPlain: string): Promise<boolean> {
    return bcrypt.compare(this.sha256(textPlain), hash);
  }

  private sha256(textPlain: string): string {
    return createHash("sha256").update(textPlain).digest("hex");
  }
}
