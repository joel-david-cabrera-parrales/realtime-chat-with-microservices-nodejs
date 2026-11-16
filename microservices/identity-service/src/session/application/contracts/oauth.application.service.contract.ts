import { OAuthLoginInput, OAuthLoginOutput } from "../../domain/use-cases/dtos/oauth.dto";

export abstract class OAuthApplicationServiceContract {
  public abstract login(input: OAuthLoginInput): Promise<OAuthLoginOutput>;
}
