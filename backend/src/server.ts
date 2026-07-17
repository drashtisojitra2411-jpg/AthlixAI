import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    console.error(
      "Server startup aborted: the database is unavailable. If this is a MongoDB Atlas " +
        '"Could not connect to any servers in your Atlas cluster" error, add this machine\'s ' +
        "current outbound IP address under Atlas -> Network Access -> Add IP Address " +
        "(for local development only, 0.0.0.0/0 also works, but is not recommended for a " +
        "deployed/shared database)."
    );
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`ATHLIX API server running on port ${env.port} [${env.nodeEnv}]`);
  });
};

startServer();
