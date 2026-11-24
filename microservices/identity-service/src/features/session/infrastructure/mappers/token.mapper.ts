import { Token } from "../../domain/aggregates/token.aggregate";
import { TokenStatus } from "../../domain/value-objects/token-status.value-object";
import { RefreshTokenEntity } from "../../../../plugins/typorm/entities/refresh-token.entity";

export class TokenMapper {
  public static toPersistence(token: Token): RefreshTokenEntity {
    const primitives = token.toPrimitives();
    const entity = new RefreshTokenEntity();

    entity.tokenCode = primitives.tokenCode;
    entity.sessionId = primitives.sessionId;
    entity.credentialId = primitives.credentialId;
    entity.profileCode = primitives.profileCode;
    entity.status = primitives.status as TokenStatus;
    entity.tokenHash = token.hash.value;
    entity.expiresAt = new Date(primitives.expiresAt);
    entity.revokedAt = primitives.revokedAt === null ? null : new Date(primitives.revokedAt);

    return entity;
  }

  public static toDomain(entity: RefreshTokenEntity): Token {
    return Token.rehydrate({
      tokenCode: entity.tokenCode,
      sessionId: entity.sessionId,
      credentialId: entity.credentialId,
      profileCode: entity.profileCode,
      status: entity.status,
      hash: entity.tokenHash,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
