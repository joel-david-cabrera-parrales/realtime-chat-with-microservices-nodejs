import { TokenPair } from "./issue-token-pair.dto";
import { SessionOutput } from "./session-output.dto";

export interface SignupProfileInput {
  fullName: string;
  email: string;
  phone?: string | undefined;
  birthDate?: string | undefined;
  gender?: string | undefined;
}

export interface SignupInput {
  username: string;
  password: string;
  expiresAt: Date;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  profile: SignupProfileInput;
}

export interface SignupOutput {
  authenticated: true;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  session: SessionOutput;
  tokens: TokenPair;
}
