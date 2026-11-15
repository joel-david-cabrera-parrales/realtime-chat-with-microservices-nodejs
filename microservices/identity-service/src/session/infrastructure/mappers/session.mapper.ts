import { Session } from "../../domain/aggregates/session.aggregate";
import { SessionStatus } from "../../domain/value-objects/session-status.value-object";
import { SessionEntity } from "../../../plugins/typorm/entities/session.entity";

export class SessionMapper {
  public static toPersistence(session: Session): SessionEntity {
    const primitives = session.toPrimitives();
    const entity = new SessionEntity();

    entity.sessionCode = primitives.id;
    entity.credentialId = primitives.credentialId;
    entity.profileCode = primitives.profileCode;
    entity.status = primitives.status as SessionStatus;
    entity.ipAddress = primitives.ipAddress;
    entity.userAgent = primitives.userAgent;
    entity.lastActivityAt = new Date(primitives.lastActivityAt);
    entity.expiresAt = new Date(primitives.expiresAt);
    entity.revokedAt = primitives.revokedAt === null ? null : new Date(primitives.revokedAt);

    return entity;
  }

  public static toDomain(entity: SessionEntity): Session {
    return Session.rehydrate({
      id: entity.sessionCode,
      credentialId: entity.credentialId,
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
