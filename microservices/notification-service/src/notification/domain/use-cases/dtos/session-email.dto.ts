export interface SessionCreatedEmailData {
  sessionId: string;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  expiresAt: string;
}

export interface SessionRevokedEmailData {
  sessionId: string;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  revokedAt: string;
  reason: string | null;
}

export interface WelcomeEmailData {
  credentialCode: string;
  profileCode: string;
  loginUrl: string;
}
