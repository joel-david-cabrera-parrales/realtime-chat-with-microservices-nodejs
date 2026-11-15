import { ExpressServer } from "./plugins/express.adapter";
import { envService } from "./plugins/env/env.provider";
import { socketProvider, SOCKET_PATH } from "./plugins/socket/socket.provider";
import { appDatasource } from "./plugins/typorm/datasource.provider";
import { realtimeFactory } from "./chat/realtime/infrastructure/realtime.factory";

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

  const io = socketProvider.create(httpServer);
  realtimeFactory.create(io, appDatasource);

  console.log(`Socket.io listening on path ${SOCKET_PATH}`);

  const shutdown = (): void => {
    console.log("Shutting down messaging-service");
    io.close();
    httpServer.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main();
