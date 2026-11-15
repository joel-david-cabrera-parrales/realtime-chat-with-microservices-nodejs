import { IssueTokenPairInput, TokenPair } from "../use-cases/dtos/issue-token-pair.dto";

export interface TokenIssuer {
  issue(input: IssueTokenPairInput): Promise<TokenPair>;
}
