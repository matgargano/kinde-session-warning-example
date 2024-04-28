import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import ViteExpress from "vite-express";

import { setupKinde } from "@kinde-oss/kinde-node-express";
import { GrantType } from "@kinde-oss/kinde-node-express";

const config = {
  audience: String(process.env.KINDE_AUDIENCE),
  grantType: GrantType.AUTHORIZATION_CODE,
  clientId: String(process.env.KINDE_CLIENT_ID),
  issuerBaseUrl: String(process.env.KINDE_ISSUER_URL),
  siteUrl: String(process.env.KINDE_SITE_URL),
  secret: String(process.env.KINDE_CLIENT_SECRET),
  redirectUrl: String(process.env.KINDE_REDIRECT_URL),
  unAuthorisedUrl: String(process.env.KINDE_UNAUTHORIZED_REDIRECT_URL),
  postLogoutRedirectUrl: String(process.env.KINDE_POST_LOGOUT_REDIRECT_URL),
  scope: "openid profile email",
};

const app = express();
const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

async function startServer() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
    app.use(
      session({
        store: new RedisStore({
          client: redisClient,
          prefix: process.env.REDIS_PREFIX,
        }),
        secret: String(process.env.SESSION_SECRET),
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.ENV?.toUpperCase() === "PRODUCTION", // use secure cookies in production
          httpOnly: true, // minimize risk of XSS attacks
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
      })
    );

    app.use(cors());
    console.log("BEFORE WE GET THE WARNING");
    setupKinde(config, app);
    console.log("AFTER WE GET THE WARNING");

    app.use(bodyParser.json());

    app.use("/", (req, res) => {
      res.status(200).json({ message: "Hello World!" });
    });

    ViteExpress.listen(app, 3001, () => {
      console.log("Server is listening on port 3001...");
    });
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1); // Exit the process if Redis connection fails
  }
}

startServer();
