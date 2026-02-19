import { Express, RequestHandler } from "express";

type RoomControllers = {
  getStrokesController: any;
  clearRoomController: any;
};

export function registerRoomRoutes(
  app: Express,
  controllers: RoomControllers,
  authMiddleware: RequestHandler
): void {
  const { getStrokesController, clearRoomController } = controllers;

  app.get("/api/rooms/:roomId/strokes", authMiddleware, getStrokesController);

  app.post("/api/rooms/:roomId/clear", authMiddleware, clearRoomController);
}
