import { Stroke } from "../entities/Stroke.js";
import { StrokeRepository } from "../repositories/StrokeRepository.js";

export async function getRoomStrokes(
  repo: StrokeRepository,
  roomId: string
): Promise<Stroke[]> {
  return repo.getRoom(roomId);
}
