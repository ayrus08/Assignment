import { StrokeRepository } from "../repositories/StrokeRepository.js";
import { Role } from "../entities/User.js";

export async function clearRoom(
  strokeRepo: StrokeRepository,
  roomId: string,
  role: Role
): Promise<void> {
  if (role !== "admin") {
    throw new Error("Forbidden");
  }

  await strokeRepo.clear(roomId);
}
