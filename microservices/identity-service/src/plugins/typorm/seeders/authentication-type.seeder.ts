import { DataSource } from "typeorm";
import { AuthenticationTypeCode, AuthenticationTypeEntity } from "../entities/authentication-type.entity";

const AUTHENTICATION_TYPES: Array<{
  code: AuthenticationTypeCode;
  name: string;
}> = [
  { code: AuthenticationTypeCode.default, name: "Default" },
  { code: AuthenticationTypeCode.google, name: "Google" },
  { code: AuthenticationTypeCode.microsoft, name: "Microsoft" },
];

export async function seedAuthenticationTypes(datasource: DataSource): Promise<void> {
  const repository = datasource.getRepository(AuthenticationTypeEntity);

  for (const authenticationType of AUTHENTICATION_TYPES) {
    const exists = await repository.findOne({
      where: { code: authenticationType.code },
    });

    if (!exists) {
      await repository.save(repository.create(authenticationType));
    }
  }
}
