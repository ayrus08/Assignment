import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { loginUser } from "../../domain/usecases/loginUser.js";

export function createAuthController(userRepo: any, secret: string) {
  return async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await loginUser(userRepo, email, password);

    const token = jwt.sign({ userId: user._id, role: user.role }, secret);

    res.json({ token, email: user.email, role: user.role, userId: user._id });
  };
}
