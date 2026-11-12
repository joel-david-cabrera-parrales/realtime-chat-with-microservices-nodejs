import { TokenIssuer } from "../interfaces/token-issuer.interface";
import { IssueTokenPairInput, TokenPair } from "./dtos/issue-token-pair.dto";

export abstract class IssueTokenPairUseCase implements TokenIssuer {
  public abstract issue(input: IssueTokenPairInput): Promise<TokenPair>;
}
