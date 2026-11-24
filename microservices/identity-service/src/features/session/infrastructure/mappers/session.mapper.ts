import { Session } from "../../domain/aggregates/session.aggregate";
import { SessionStatus } from "../../domain/value-objects/session-status.value-object";
import { SessionEntity } from "../../../../plugins/typorm/entities/session.entity";
import { CredentialEntity } from "../../../../plugins/typorm/entities/credential.entity";

export class SessionMapper {
  public static toPersistence(session: Session): SessionEntity {
    const primitives = session.toPrimitives();
    const entity = new SessionEntity();

    entity.sessionCode = primitives.id;
    entity.profileCode = primitives.profileCode;
    entity.status = primitives.status as SessionStatus;
    entity.ipAddress = primitives.ipAddress;
    entity.userAgent = primitives.userAgent;
    entity.lastActivityAt = new Date(primitives.lastActivityAt);
    entity.expiresAt = new Date(primitives.expiresAt);
    entity.revokedAt = primitives.revokedAt === null ? null : new Date(primitives.revokedAt);

    // Setear la relación credential usando el credentialId del aggregate
    const credentialEntity = new CredentialEntity();
    credentialEntity.id = primitives.credentialId;
    entity.credential = credentialEntity;

    return entity;
  }

  public static toDomain(entity: SessionEntity): Session {
    return Session.rehydrate({
      id: entity.sessionCode,
      credentialId: entity.credential.id,
      credentialCode: entity.credential.credentialCode,
      profileCode: entity.profileCode,
      status: entity.status,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      lastActivityAt: entity.lastActivityAt,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}