import "dotenv/config";
import express from "express";

import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import ViteExpress from "vite-express";

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
    app.get("/", (req, res) => {
      req.session.views = (req.session.views || 0) + 1;
      res.send(
        `<h1>Hello, you have viewed this page ${req.session.views} times.</h1>`
      );
    });
    ViteExpress.listen(app, 3000, () => {
      console.log("Server is listening on port 3000...");
    });
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1); // Exit the process if Redis connection fails
  }
}

startServer();
