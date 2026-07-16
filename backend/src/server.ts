import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`ATHLIX API server running on port ${env.port} [${env.nodeEnv}]`);
  });
};

startServer();
