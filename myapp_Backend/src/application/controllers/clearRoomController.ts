import { Request, Response } from "express";
import { NatsConnection, StringCodec } from "nats";

import { clearRoom } from "../../domain/usecases/clearRoom.js";
import { StrokeRepository } from "../../domain/repositories/StrokeRepository.js";
import { Role } from "../../domain/entities/User.js";

const sc = StringCodec();

type Params = {
  roomId: string;
};

type AuthRequest = Request<Params> & {
  user?: {
    userId: string;
    role: Role;
    email: string;
  };
};

export function createClearRoomController(
  strokeRepo: StrokeRepository,
  nc: NatsConnection
) {
  return async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { roomId } = req.params;

      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const role = req.user.role;

      await clearRoom(strokeRepo, roomId, role);

      nc.publish(`room.${roomId}.clear`, sc.encode(JSON.stringify({ roomId })));

      res.json({ success: true });
    } catch {
      res.status(403).json({ error: "Forbidden" });
    }
  };
}
