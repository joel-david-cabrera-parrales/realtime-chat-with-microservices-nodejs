import { ProfileCode } from "../value-objects/profile-code.value-object";
import { SessionId } from "../value-objects/session-id.value-object";
import { TokenCode } from "../value-objects/token-code.value-object";
import { TokenHash } from "../value-objects/token-hash.value-object";
import { TokenStatusValue } from "../value-objects/token-status.value-object";

export interface TokenProps {
  code: TokenCode;
  sessionId: SessionId;
  credentialId: number;
  profileCode: ProfileCode;
  status: TokenStatusValue;
  hash: TokenHash;
  expiresAt: Date;
  revokedAt: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTokenProps {
  sessionId: string;
  credentialId: number;
  profileCode: string;
  hash: string;
  expiresAt: Date;
}

export interface RehydrateTokenProps {
  tokenCode: string;
  sessionId: string;
  credentialId: number;
  profileCode: string;
  status: string;
  hash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPayload {
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  username: string;
  sessionId: string;
}

export interface TokenPrimitives {
  tokenCode: string;
  sessionId: string;
  credentialId: number;
  profileCode: string;
  status: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
