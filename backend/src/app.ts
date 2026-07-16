import cors from "cors";
import express, { type Application } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import routes from "./routes";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());

if (env.nodeEnv !== "production") {
  app.use(morgan("dev"));
}

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
