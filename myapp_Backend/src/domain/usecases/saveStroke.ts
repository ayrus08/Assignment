import { Stroke } from "../entities/Stroke.js";
import { StrokeRepository } from "../repositories/StrokeRepository.js";

export async function saveStroke(
  strokeRepo: StrokeRepository,
  roomId: string,
  stroke: Stroke
): Promise<void> {
  await strokeRepo.save(roomId, stroke);
}
