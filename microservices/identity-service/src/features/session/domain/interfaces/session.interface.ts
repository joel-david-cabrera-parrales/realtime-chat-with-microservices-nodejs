import { IpAddress } from "../value-objects/ip-address.value-object";
import { ProfileCode } from "../value-objects/profile-code.value-object";
import { SessionId } from "../value-objects/session-id.value-object";
import { SessionStatusValue } from "../value-objects/session-status.value-object";
import { UserAgent } from "../value-objects/user-agent.value-object";
import { Credential } from "../aggregates/credential.aggregate";

export interface SessionProps {
  id: SessionId;
  credential: Credential;
  profileCode: ProfileCode;
  status: SessionStatusValue;
  ipAddress: IpAddress | undefined;
  userAgent: UserAgent | undefined;
  lastActivityAt: Date;
  expiresAt: Date;
  revokedAt: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionProps {
  credential: Credential;
  profileCode: string;
  expiresAt: Date;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export interface RehydrateSessionProps {
  id: string;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastActivityAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionPrimitives {
  id: string;
  credentialId: number;
  credentialCode: string;
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
