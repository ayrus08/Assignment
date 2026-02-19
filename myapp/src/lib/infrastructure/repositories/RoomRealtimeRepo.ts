import { get } from 'svelte/store';
import { connectRoomNats, codec } from '../websocket/roomNats';
import { roomStore } from '$lib/presentation/stores/roomStore';

let nc: any;

export const roomRealtimeRepo = {
	async init(roomId: string, userID: string) {
		nc = await connectRoomNats();

		const { addStroke, removeStroke, clear, updateCursor } = roomStore;
		const sc = codec;

		// draw
		(async () => {
			const sub = nc.subscribe(`room.${roomId}.draw`);
			for await (const m of sub) {
				const stroke = JSON.parse(sc.decode(m.data));
				if (stroke.userID === userID) continue;
				addStroke(stroke);
			}
		})();

		// erase
		(async () => {
			const sub = nc.subscribe(`room.${roomId}.erase`);
			for await (const m of sub) {
				const msg = JSON.parse(sc.decode(m.data));
				if (msg.userID === userID) continue;
				removeStroke(msg.strokeId);
			}
		})();

		// clear
		(async () => {
			const sub = nc.subscribe(`room.${roomId}.clear`);
			for await (const m of sub) {
				clear();
			}
		})();

		// cursor
		(async () => {
			const sub = nc.subscribe(`room.${roomId}.cursor`);
			for await (const m of sub) {
				const data = JSON.parse(sc.decode(m.data));
				if (data.userID === userID) continue;

				updateCursor(data.userID, {
					x: data.x,
					y: data.y,
					role: data.role
				});
			}
		})();
	},

	sendStroke(roomId: string, stroke: any) {
		const sc = codec;
		nc.publish(`room.${roomId}.draw`, sc.encode(JSON.stringify(stroke)));
	},

	eraseStroke(roomId: string, strokeId: string, userID: string) {
		const sc = codec;
		nc.publish(`room.${roomId}.erase`, sc.encode(JSON.stringify({ strokeId, userID })));
	},

	sendCursor(roomId: string, data: any) {
		const sc = codec;
		nc.publish(`room.${roomId}.cursor`, sc.encode(JSON.stringify(data)));
	},

	close() {
		nc?.close();
	}
};
