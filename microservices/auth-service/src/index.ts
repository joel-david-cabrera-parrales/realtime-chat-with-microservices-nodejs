import dotenv from "dotenv";
import { ExpressServer } from "./plugins/express.adapter";
import { appDatasource } from "./plugins/typorm/datasource.provider";
import { seedAuthenticationTypes } from "./plugins/typorm/seeders/authentication-type.seeder";

dotenv.config();

const port = Number(process.env.PORT ?? 3001);

async function main(): Promise<void> {
  try {
    if (!appDatasource.isInitialized) {
      await appDatasource.initialize();
      await seedAuthenticationTypes(appDatasource);
      console.log("Database connected");
    }
  } catch (error) {
    console.error("Database connection failed:", error);
    console.warn("Server will start anyway; /api/health will report degraded");
  }

  const server = new ExpressServer({ port, jsonSpaces: 2 });
  server.start();
}

main();
