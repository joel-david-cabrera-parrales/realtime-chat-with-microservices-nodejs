import { TokenPair } from "./issue-token-pair.dto";
import { SessionOutput } from "./session-output.dto";

export interface SigninInput {
  username: string;
  password: string;
  expiresAt: Date;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export interface SigninOutput {
  authenticated: true;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  session: SessionOutput;
  tokens: TokenPair;
}
