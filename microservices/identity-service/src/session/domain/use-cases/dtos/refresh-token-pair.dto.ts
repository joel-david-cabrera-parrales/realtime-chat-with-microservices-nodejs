import { TokenPair } from "./issue-token-pair.dto";

export interface RefreshTokenPairInput {
  refreshToken: string;
}

export type RefreshTokenPairOutput = TokenPair;
