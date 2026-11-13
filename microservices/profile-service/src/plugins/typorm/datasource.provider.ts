import { envService } from "../env/env.provider";
import { TORMDatasouce, AvailableDatasource } from "./type-orm.datasource";

export const appDatasource = new TORMDatasouce({
  type: AvailableDatasource.postgres,
  host: envService.getOptional("TORM_HOST_DB") ?? "localhost",
  port: envService.getInt("TORM_PORT_DB", 5432),
  username: envService.getOptional("TORM_USER_DB") ?? "postgres",
  password: envService.getOptional("TORM_PASSWORD_DB") ?? "postgres",
  database: envService.getOptional("TORM_NAME_DB") ?? "profile_db",
  logging: true,
  synchronize: true,
}).appDatasource;
