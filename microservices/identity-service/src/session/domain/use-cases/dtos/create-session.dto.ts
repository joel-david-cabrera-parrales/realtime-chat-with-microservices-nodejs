import { Credential } from "../../aggregates/credential.aggregate";

export interface CreateSessionInput {
  credential: Credential;
  expiresAt: Date;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}
