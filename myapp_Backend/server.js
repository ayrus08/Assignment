import express from "express";
import cors from "cors";
import { connect, StringCodec } from "nats";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = "supersecret";

const app = express();
app.use(cors());
app.use(express.json());

const sc = StringCodec();

//
// CONNECT MONGO
//
const mongo = new MongoClient("mongodb://localhost:27017");
await mongo.connect();

const db = mongo.db("whiteboard");
const strokesCol = db.collection("strokes");
const usersCol = db.collection("users");

console.log("Mongo connected");

//
// CONNECT NATS (TCP 4222)
//
const nc = await connect({
  servers: "nats://localhost:4222",
});

console.log("Connected to NATS");

//
// SUBSCRIBE DRAW
//
const drawSub = nc.subscribe("room.*.draw");

(async () => {
  for await (const msg of drawSub) {
    const stroke = JSON.parse(sc.decode(msg.data));
    const roomId = msg.subject.split(".")[1];

    await strokesCol.insertOne({
      ...stroke,
      roomId,
    });

    console.log("Saved stroke:", stroke.strokeId);
  }
})();

//
// SUBSCRIBE ERASE
//
const eraseSub = nc.subscribe("room.*.erase");

(async () => {
  for await (const msg of eraseSub) {
    const data = JSON.parse(sc.decode(msg.data));
    const roomId = msg.subject.split(".")[1];

    await strokesCol.deleteOne({
      strokeId: data.strokeId,
      roomId,
    });

    console.log("Deleted stroke:", data.strokeId);
  }
})();

//      LOGIN API

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usersCol.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

//
// FETCH STROKES FOR ROOM
//
app.get("/api/rooms/:roomId/strokes", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    // later we will verify JWT here
    // const user = verifyToken(req.headers.authorization)

    const strokes = await strokesCol
      .find({ roomId })
      .sort({ _id: 1 })
      .toArray();

    res.json(strokes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch strokes" });
  }
});

// CLEAR ROOM (ADMIN ONLY)
app.post("/api/rooms/:roomId/clear", authMiddleware, async (req, res) => {
  const { roomId } = req.params;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Not allowed" });
  }

  await strokesCol.deleteMany({ roomId });

  // broadcast clear event
  nc.publish(
    `room.${roomId}.clear`,
    sc.encode(
      JSON.stringify({
        roomId,
      })
    )
  );

  res.json({ success: true });
});

//      MIDDLEWARE

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "No token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.listen(3001, () => {
  console.log("Backend running → http://localhost:3001");
});
