import { Credential } from "../../domain/aggregates/credential.aggregate";
import { CredentialEntity } from "../../../plugins/typorm/entities/credential.entity";

export class CredentialMapper {
  public static toPersistence(credential: Credential): CredentialEntity {
    const primitives = credential.toPrimitives();
    const entity = new CredentialEntity();

    entity.credentialCode = primitives.credentialCode;
    entity.username = primitives.username;
    entity.passwordHash = credential.passwordHash?.value ?? null;
    entity.profileCode = primitives.profileCode;

    return entity;
  }

  public static toDomain(entity: CredentialEntity): Credential {
    return Credential.rehydrate({
      credentialId: entity.id,
      credentialCode: entity.credentialCode,
      username: entity.username,
      passwordHash: entity.passwordHash,
      profileCode: entity.profileCode,
      isAuthenticated: false,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
