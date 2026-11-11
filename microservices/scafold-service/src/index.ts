import "dotenv/config";
import { EnvAdapter } from "./plugins/env/env.adapter";
import { AvailableDatasource, TORMDatasouce } from "./plugins/typorm/type-orm.datasource";
import { ServerProps } from "./shared/interfaces/server-props.interface";
import { ExpressServer } from "./plugins/express.adapter";

const envService = new EnvAdapter();

const serverProps: ServerProps = {
  port: envService.getInt("PORT", 3000),
  jsonSpaces: 2,
};

const conectionProps = {
  type: AvailableDatasource.postgres,
  host: envService.get("TORM_HOST_DB"),
  port: envService.getInt("TORM_PORT_DB"),
  username: envService.get("TORM_USER_DB"),
  password: envService.get("TORM_PASSWORD_DB"),
  database: envService.get("TORM_NAME_DB"),
  logging: true,
  synchronize: true,
};

const bootstrap = async (): Promise<void> => {
  const orm = new TORMDatasouce(conectionProps);
  await orm.appDatasource.initialize();

  const server = new ExpressServer(serverProps);
  server.start();
};

bootstrap().catch((err) => {
  console.error("[FATAL] No se pudo inicializar la base de datos:", err);
  process.exit(1);
});
