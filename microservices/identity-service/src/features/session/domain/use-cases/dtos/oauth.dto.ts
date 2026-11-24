import { AuthenticationTypeCode } from "../../constants/authentication-type.constants";
import { TokenPair } from "./issue-token-pair.dto";
import { SessionOutput } from "./session-output.dto";

export interface OAuthLoginInput {
  email: string;
  fullName: string;
  authenticationType: AuthenticationTypeCode;
  expiresAt: Date;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export interface OAuthLoginOutput {
  authenticated: true;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  session: SessionOutput;
  tokens: TokenPair;
}
