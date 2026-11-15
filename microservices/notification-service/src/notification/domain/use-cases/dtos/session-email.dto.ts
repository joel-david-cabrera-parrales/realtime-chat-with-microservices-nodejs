export interface SessionCreatedEmailData {
  sessionId: string;
  credentialId: number;
  profileCode: string;
  expiresAt: string;
}

export interface SessionRevokedEmailData {
  sessionId: string;
  credentialId: number;
  profileCode: string;
  revokedAt: string;
  reason: string | null;
}
