import { Request, Response } from "express";
import { getRoomStrokes } from "../../domain/usecases/getRoomStrokes.js";
import { StrokeRepository } from "../../domain/repositories/StrokeRepository.js";

type Params = {
  roomId: string;
};

export function createGetStrokesController(strokeRepo: StrokeRepository) {
  return async (req: Request<Params>, res: Response): Promise<void> => {
    try {
      const { roomId } = req.params;

      const strokes = await getRoomStrokes(strokeRepo, roomId);
      res.json(strokes);
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  };
}
