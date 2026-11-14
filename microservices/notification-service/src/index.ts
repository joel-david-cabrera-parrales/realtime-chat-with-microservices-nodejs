import { ExpressServer } from "./plugins/express.adapter";
import { envService } from "./plugins/env/env.provider";
import { eventConsumer } from "./plugins/kafka/kafka.provider";
import { appDatasource } from "./plugins/typorm/datasource.provider";
import { notificationFactory } from "./notification/infrastructure/notification.factory";

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

  notificationFactory.registerListeners(eventConsumer);

  try {
    await eventConsumer.start();
  } catch (error) {
    console.error("Kafka consumer connection failed:", error);
    console.warn("Server will start anyway; notifications will not be delivered");
  }

  const server = new ExpressServer({ port, jsonSpaces: 2 });
  server.start();
}

const shutdown = async (signal: string): Promise<void> => {
  console.log(`${signal} received; shutting down`);
  await eventConsumer.stop();
  process.exit(0);
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

main();
