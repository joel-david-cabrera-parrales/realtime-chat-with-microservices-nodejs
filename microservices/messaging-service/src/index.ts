import { ExpressServer } from "./plugins/express.adapter";
import { envService } from "./plugins/env/env.provider";
import { socketProvider, SOCKET_PATH } from "./plugins/socket/socket.provider";
import { appDatasource } from "./plugins/typorm/datasource.provider";
import { realtimeFactory } from "./chat/realtime/infrastructure/realtime.factory";
import { chatFactory } from "./chat/infrastructure/chat.factory";
import { eventConsumer } from "./plugins/kafka/kafka.provider";
import { CredentialCreatedListener } from "./chat/infrastructure/listeners/credential-created.listener";
import { CredentialUpdatedListener } from "./chat/infrastructure/listeners/credential-updated.listener";
import { CredentialDeletedListener } from "./chat/infrastructure/listeners/credential-deleted.listener";
import { TypeOrmUserCredentialDataSource } from "./chat/infrastructure/datasources/typeorm-user-credential.datasource";

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
  const httpServer = server.start();

  chatFactory.createRouter(appDatasource);

  const io = socketProvider.create(httpServer);
  realtimeFactory.create(io, appDatasource);

  console.log(`Socket.io listening on path ${SOCKET_PATH}`);

  const userCredentialDataSource = new TypeOrmUserCredentialDataSource(appDatasource);
  const credentialCreatedListener = new CredentialCreatedListener(userCredentialDataSource);
  const credentialUpdatedListener = new CredentialUpdatedListener(userCredentialDataSource);
  const credentialDeletedListener = new CredentialDeletedListener(userCredentialDataSource);
  eventConsumer.subscribe(credentialCreatedListener);
  eventConsumer.subscribe(credentialUpdatedListener);
  eventConsumer.subscribe(credentialDeletedListener);
  await eventConsumer.start();

  const shutdown = async (): Promise<void> => {
    console.log("Shutting down messaging-service");
    await eventConsumer.stop();
    io.close();
    httpServer.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main();
