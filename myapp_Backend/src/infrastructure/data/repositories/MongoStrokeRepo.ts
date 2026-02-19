import { Collection } from "mongodb";
import { Stroke } from "../../../domain/entities/Stroke.js";
import { StrokeRepository } from "../../../domain/repositories/StrokeRepository.js";

export class MongoStrokeRepo implements StrokeRepository {
  constructor(private col: Collection<Stroke & { roomId: string }>) {}

  async save(roomId: string, stroke: Stroke) {
    await this.col.insertOne({ ...stroke, roomId });
  }

  async delete(roomId: string, strokeId: string) {
    await this.col.deleteOne({ roomId, strokeId });
  }

  async clear(roomId: string) {
    await this.col.deleteMany({ roomId });
  }

  async getRoom(roomId: string): Promise<Stroke[]> {
    return await this.col.find({ roomId }).sort({ _id: 1 }).toArray();
  }
}
