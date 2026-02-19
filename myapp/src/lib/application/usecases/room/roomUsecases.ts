import { roomRealtimeRepo } from '$lib/infrastructure/repositories/RoomRealtimeRepo';
import { clearRoomApi, fetchStrokes } from '$lib/infrastructure/api/roomApi';
import { roomStore } from '$lib/presentation/stores/roomStore';

export const roomUsecases = {
	async initRoom(roomId: string, userID: string, token: string) {
		await roomRealtimeRepo.init(roomId, userID);

		const data = await fetchStrokes(roomId, token);
		roomStore.setStrokes(data);
	},

	sendStroke(roomId: string, stroke: any) {
		roomRealtimeRepo.sendStroke(roomId, stroke);
		roomStore.addStroke(stroke);
	},

	eraseStroke(roomId: string, strokeId: string, userID: string) {
		roomRealtimeRepo.eraseStroke(roomId, strokeId, userID);
		roomStore.removeStroke(strokeId);
	},

	sendCursor(roomId: string, data: any) {
		roomRealtimeRepo.sendCursor(roomId, data);
	},

	async clearCanvas(roomId: string, token: string) {
		await clearRoomApi(roomId, token);
	},

	cleanup() {
		roomRealtimeRepo.close();
	}
};
