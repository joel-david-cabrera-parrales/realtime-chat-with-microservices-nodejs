import { ExpressServer } from "./plugins/express.adapter";
import { envService } from "./plugins/env/env.provider";
import { appDatasource } from "./plugins/typorm/datasource.provider";
import { eventConsumer } from "./plugins/kafka/kafka.provider";
import { CredentialCreatedListener } from "./files/infrastructure/listeners/credential-created.listener";
import { CredentialUpdatedListener } from "./files/infrastructure/listeners/credential-updated.listener";
import { CredentialDeletedListener } from "./files/infrastructure/listeners/credential-deleted.listener";
import { TypeOrmUserCredentialDataSource } from "./files/infrastructure/datasources/typeorm-user-credential.datasource";
import { filesFactory } from "./files/infrastructure/files.factory";

const port = envService.getInt("PORT", 3000);

async function main(): Promise<void> {
  try {
    if (!appDatasource.isInitialized) {
      await appDatasource.initialize();
      console.log("Database connected");
    }
  } catch (error) {
    console.error("Database connection failed:", error);
    console.warn("Server will start anyway; /api/health will report degraded");
  }

  const server = new ExpressServer({ port, jsonSpaces: 2 });
  server.start();

  filesFactory.createRouter(appDatasource);

  const userCredentialDataSource = new TypeOrmUserCredentialDataSource(appDatasource);
  eventConsumer.subscribe(new CredentialCreatedListener(userCredentialDataSource));
  eventConsumer.subscribe(new CredentialUpdatedListener(userCredentialDataSource));
  eventConsumer.subscribe(new CredentialDeletedListener(userCredentialDataSource));
  await eventConsumer.start();

  const shutdown = async (): Promise<void> => {
    console.log("Shutting down media-service");
    await eventConsumer.stop();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main();
