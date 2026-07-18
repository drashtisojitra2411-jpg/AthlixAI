import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
};

export const isProduction = env.nodeEnv === "production";

// JWT_SECRET and MONGODB_URI silently defaulting to "" would let the server
// boot into a broken state — an empty JWT secret makes every token trivially
// forgeable (jwt.sign/verify accept ""), and an empty Mongo URI fails with a
// confusing driver error far from this file. Fail fast at startup instead.
const REQUIRED_ENV_VARS: Array<[keyof typeof env, string]> = [
  ["jwtSecret", "JWT_SECRET"],
  ["mongodbUri", "MONGODB_URI"],
];

const missing = REQUIRED_ENV_VARS.filter(([key]) => !env[key]).map(([, name]) => name);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(", ")}. Set them in backend/.env before starting the server.`
  );
}
