import { Token } from "../aggregates/token.aggregate";
import { SessionId } from "../value-objects/session-id.value-object";
import { TokenCode } from "../value-objects/token-code.value-object";

export abstract class TokenRepository {
  abstract save(token: Token): Promise<void>;
  abstract findByCode(code: TokenCode): Promise<Token | null>;
  abstract findBySessionId(sessionId: SessionId): Promise<Token[]>;
  abstract findActiveByCredentialId(credentialId: number): Promise<Token[]>;
  abstract existsByCode(code: TokenCode): Promise<boolean>;
  abstract delete(code: TokenCode): Promise<void>;
}
