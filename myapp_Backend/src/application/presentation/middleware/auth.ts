import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../../../domain/entities/User.js";

const JWT_SECRET = "supersecret";

export interface AuthPayload {
  userId: string;
  role: Role;
  email: string;
}

export function authMiddleware(
  req: Request & { user?: AuthPayload },
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header) {
    res.status(401).json({ error: "No token" });
    return;
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
