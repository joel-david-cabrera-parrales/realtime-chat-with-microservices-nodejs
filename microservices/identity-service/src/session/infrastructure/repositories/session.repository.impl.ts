import { Session } from "../../domain/aggregates/session.aggregate";
import { SessionDataSource } from "../../domain/datasources/session.datasource";
import { SessionRepository } from "../../domain/repositories/session.repository";
import { SessionId } from "../../domain/value-objects/session-id.value-object";

export class SessionRepositoryImpl implements SessionRepository {
  constructor(private readonly sessionDataSource: SessionDataSource) {}

  public save(session: Session): Promise<void> {
    return this.sessionDataSource.save(session);
  }

  public findById(id: SessionId): Promise<Session | null> {
    return this.sessionDataSource.findById(id);
  }

  public findByCredentialId(credentialId: number): Promise<Session[]> {
    return this.sessionDataSource.findByCredentialId(credentialId);
  }

  public findActiveByCredentialId(credentialId: number): Promise<Session[]> {
    return this.sessionDataSource.findActiveByCredentialId(credentialId);
  }

  public existsById(id: SessionId): Promise<boolean> {
    return this.sessionDataSource.existsById(id);
  }

  public delete(id: SessionId): Promise<void> {
    return this.sessionDataSource.delete(id);
  }
}
