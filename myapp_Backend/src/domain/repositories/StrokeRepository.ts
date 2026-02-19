import { Stroke } from "../entities/Stroke.js";

export interface StrokeRepository {
  save(roomId: string, stroke: Stroke): Promise<void>;
  delete(roomId: string, strokeId: string): Promise<void>;
  clear(roomId: string): Promise<void>;
  getRoom(roomId: string): Promise<Stroke[]>;
}
