import { RefreshTokenPairInput, RefreshTokenPairOutput } from "../../domain/use-cases/dtos/refresh-token-pair.dto";
import { SessionOutput } from "../../domain/use-cases/dtos/session-output.dto";
import { SigninInput, SigninOutput } from "../../domain/use-cases/dtos/signin.dto";

export abstract class SessionApplicationServiceContract {
  public abstract signin(input: SigninInput): Promise<SigninOutput>;
  public abstract getById(id: string): Promise<SessionOutput | null>;
  public abstract list(credentialId: number): Promise<SessionOutput[]>;
  public abstract refresh(input: RefreshTokenPairInput): Promise<RefreshTokenPairOutput>;
  public abstract revoke(id: string): Promise<SessionOutput>;
  public abstract updateActivity(id: string): Promise<SessionOutput>;
}
