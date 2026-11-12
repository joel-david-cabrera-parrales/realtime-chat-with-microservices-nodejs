export interface IssueTokenPairInput {
  sessionId: string;
  credentialId: number;
  profileCode: string;
  username: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}
