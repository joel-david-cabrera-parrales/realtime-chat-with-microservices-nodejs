import { TokenPair } from "./issue-token-pair.dto";

export interface CreateSessionOutput {
  session: SessionOutput;
  tokens: TokenPair;
}

export interface SessionOutput {
  id: string;
  credentialId: number;
  profileCode: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastActivityAt: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
