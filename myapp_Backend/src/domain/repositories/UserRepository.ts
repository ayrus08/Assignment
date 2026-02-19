import { User } from "../entities/User.js";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
}
