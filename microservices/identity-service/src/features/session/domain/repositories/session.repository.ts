import { Session } from "../aggregates/session.aggregate";
import { SessionId } from "../value-objects/session-id.value-object";

export abstract class SessionRepository {
  abstract save(session: Session): Promise<void>;
  abstract findById(id: SessionId): Promise<Session | null>;
  abstract findByCredentialId(credentialId: number): Promise<Session[]>;
  abstract findActiveByCredentialId(credentialId: number): Promise<Session[]>;
  abstract existsById(id: SessionId): Promise<boolean>;
  abstract delete(id: SessionId): Promise<void>;
}
