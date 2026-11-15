import bcrypt from "bcrypt";
import { HashService } from "../../shared/domain/hash.service";

export interface BcryptAdapterOptions {
  saltRounds: number;
}

export class BcryptAdapter extends HashService {
  private readonly saltRounds: number;

  constructor(options: BcryptAdapterOptions) {
    super();
    this.saltRounds = options.saltRounds;
  }

  public async verifyHash(hash: string, textPlain: string): Promise<boolean> {
    return bcrypt.compare(textPlain, hash);
  }

  public async hash(textPlain: string): Promise<string> {
    return bcrypt.hash(textPlain, this.saltRounds);
  }

  public async hashToken(textPlain: string): Promise<string> {
    return bcrypt.hash(textPlain, this.saltRounds);
  }
}
