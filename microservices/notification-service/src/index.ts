import { ExpressServer } from "./plugins/express.adapter";
import { envService } from "./plugins/env/env.provider";
import { eventConsumer } from "./plugins/kafka/kafka.provider";
import { appDatasource } from "./plugins/typorm/datasource.provider";
import { notificationFactory } from "./notification/infrastructure/notification.factory";
import { emailService } from "./plugins/email/email.provider";

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

  // Verify SMTP connection
  try {
    await emailService.verifyConnection();
  } catch (error) {
    console.warn("SMTP connection verification failed; emails may not be delivered:", error);
  }

  const { sendWelcomeEmail } = notificationFactory.registerListeners(eventConsumer, appDatasource);

  try {
    await eventConsumer.start();
  } catch (error) {
    console.error("Kafka consumer connection failed:", error);
    console.warn("Server will start anyway; notifications will not be delivered");
  }

  const server = new ExpressServer({ port, jsonSpaces: 2 });

  // Endpoint para enviar email de bienvenida (llamado desde identity-service tras signup)
  server.expressApp.post("/api/notifications/welcome", async (req, res) => {
    try {
      const { credentialCode, loginUrl, profileCode } = req.body;
      if (!credentialCode || !loginUrl || !profileCode) {
        return res.status(400).json({ error: "credentialCode, loginUrl and profileCode are required" });
      }
      await sendWelcomeEmail.execute({ credentialCode, loginUrl, profileCode });
      return res.json({ success: true });
    } catch (error) {
      console.error("[notification] Error sending welcome email:", error);
      return res.status(500).json({ error: "Failed to send welcome email" });
    }
  });

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
