import bcrypt from "bcrypt";
import { User } from "../entities/User.js";
import { UserRepository } from "../repositories/UserRepository.js";

export async function loginUser(
  userRepo: UserRepository,
  email: string,
  password: string
): Promise<User> {
  const user = await userRepo.findByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    throw new Error("Invalid credentials");
  }

  return user;
}
