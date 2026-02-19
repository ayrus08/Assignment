import { roomUsecases } from '$lib/application/usecases/room/roomUsecases';

export const roomController = {
	init(roomId: string, userID: string, token: string) {
		return roomUsecases.initRoom(roomId, userID, token);
	},

	sendStroke(roomId: string, stroke: any) {
		roomUsecases.sendStroke(roomId, stroke);
	},

	eraseStroke(roomId: string, strokeId: string, userID: string) {
		roomUsecases.eraseStroke(roomId, strokeId, userID);
	},

	sendCursor(roomId: string, data: any) {
		roomUsecases.sendCursor(roomId, data);
	},

	clear(roomId: string, token: string) {
		return roomUsecases.clearCanvas(roomId, token);
	},

	cleanup() {
		roomUsecases.cleanup();
	}
};
