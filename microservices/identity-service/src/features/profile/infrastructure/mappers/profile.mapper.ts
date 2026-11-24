import { Profile } from "../../domain/aggregates/profile.aggregate";
import { ProfileEntity } from "../../../../plugins/typorm/entities/profile.entity";

export class ProfileMapper {
  public static toPersistence(profile: Profile): ProfileEntity {
    const primitives = profile.toPrimitives();
    const entity = new ProfileEntity();

    entity.profileCode = primitives.id;
    entity.fullName = primitives.fullName;
    entity.email = primitives.email;
    entity.phone = primitives.phone;
    entity.birthDate = primitives.birthDate;
    entity.gender = primitives.gender;
    entity.bio = primitives.bio;
    entity.avatarFileCode = primitives.avatarFileCode;

    return entity;
  }

  public static toDomain(entity: ProfileEntity): Profile {
    return Profile.rehydrate({
      id: entity.profileCode,
      fullName: entity.fullName,
      email: entity.email,
      phone: entity.phone,
      birthDate: entity.birthDate,
      gender: entity.gender,
      bio: entity.bio,
      avatarFileCode: entity.avatarFileCode,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
