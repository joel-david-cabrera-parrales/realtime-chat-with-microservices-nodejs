import { Token } from "../../domain/aggregates/token.aggregate";
import { TokenDataSource } from "../../domain/datasources/token.datasource";
import { TokenRepository } from "../../domain/repositories/token.repository";
import { SessionId } from "../../domain/value-objects/session-id.value-object";
import { TokenCode } from "../../domain/value-objects/token-code.value-object";

export class TokenRepositoryImpl implements TokenRepository {
  constructor(private readonly tokenDataSource: TokenDataSource) {}

  public save(token: Token): Promise<void> {
    return this.tokenDataSource.save(token);
  }

  public findByCode(code: TokenCode): Promise<Token | null> {
    return this.tokenDataSource.findByCode(code);
  }

  public findBySessionId(sessionId: SessionId): Promise<Token[]> {
    return this.tokenDataSource.findBySessionId(sessionId);
  }

  public findActiveByCredentialId(credentialId: number): Promise<Token[]> {
    return this.tokenDataSource.findActiveByCredentialId(credentialId);
  }

  public existsByCode(code: TokenCode): Promise<boolean> {
    return this.tokenDataSource.existsByCode(code);
  }

  public delete(code: TokenCode): Promise<void> {
    return this.tokenDataSource.delete(code);
  }
}
