import { Collection } from "mongodb";
import { User } from "../../../domain/entities/User.js";

export class MongoUserRepo {
  private col: Collection<User>;

  constructor(col: Collection<User>) {
    this.col = col;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.col.findOne({ email });
  }
}
