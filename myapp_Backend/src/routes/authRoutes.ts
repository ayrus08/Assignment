import { Express, RequestHandler } from "express";

type AuthControllers = {
  loginController: RequestHandler;
};

export function registerAuthRoutes(
  app: Express,
  controllers: AuthControllers
): void {
  const { loginController } = controllers;

  app.post("/api/login", loginController);
}
