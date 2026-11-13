import dotenv from "dotenv";
import { AvailableDatasource, TORMDatasouce } from "./type-orm.datasource";

dotenv.config();

export const appDatasource = new TORMDatasouce({
  type: AvailableDatasource.postgres,
  host: process.env.TORM_HOST_DB ?? "localhost",
  port: Number(process.env.TORM_PORT_DB ?? 5432),
  username: process.env.TORM_USER_DB ?? "postgres",
  password: process.env.TORM_PASSWORD_DB ?? "postgres",
  database: process.env.TORM_NAME_DB ?? "storage_db",
  logging: true,
  synchronize: true,
}).appDatasource;
