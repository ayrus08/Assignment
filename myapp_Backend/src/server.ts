import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import { connect, StringCodec } from "nats";

import { MongoUserRepo } from "./infrastructure/data/repositories/MongoUserRepo.js";
import { MongoStrokeRepo } from "./infrastructure/data/repositories/MongoStrokeRepo.js";

import { createAuthController } from "./application/controllers/authController.js";
import { createGetStrokesController } from "./application/controllers/getStrokesController.js";
import { createClearRoomController } from "./application/controllers/clearRoomController.js";
import { startNats } from "./application/controllers/natsController.js";

import { registerAuthRoutes } from "./routes/authRoutes.js";
import { registerRoomRoutes } from "./routes/roomRoutes.js";

import { authMiddleware } from "./application/presentation/middleware/auth.js";

const JWT_SECRET = "supersecret";

async function start() {
  try {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Mongo
    const mongo = new MongoClient("mongodb://localhost:27017");
    await mongo.connect();
    console.log("Mongo connected");

    const db = mongo.db("whiteboard");

    const userRepo = new MongoUserRepo(db.collection("users"));
    const strokeRepo = new MongoStrokeRepo(db.collection("strokes"));

    // NATS
    const nc = await connect({ servers: "nats://localhost:4222" });
    console.log("NATS connected");

    const sc = StringCodec();
    startNats(nc, sc, strokeRepo);

    // Controllers
    const loginController = createAuthController(userRepo, JWT_SECRET);
    const getStrokesController = createGetStrokesController(strokeRepo);
    const clearRoomController = createClearRoomController(strokeRepo, nc);

    // Routes
    registerAuthRoutes(app, { loginController });

    registerRoomRoutes(
      app,
      {
        getStrokesController,
        clearRoomController,
      },
      authMiddleware
    );

    app.listen(3001, () => {
      console.log("Backend running on http://localhost:3001");
    });
  } catch (err) {
    console.error("🔥 SERVER START FAILED:");
    console.error(err);
  }
}

start();
