import { StrokeRepository } from "../repositories/StrokeRepository.js";

export async function deleteStroke(
  repo: StrokeRepository,
  roomId: string,
  strokeId: string
): Promise<void> {
  await repo.delete(roomId, strokeId);
}
