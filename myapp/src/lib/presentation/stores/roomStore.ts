import { writable } from 'svelte/store';
import type { Stroke } from '$lib/domain/entities/Stroke';
import type { Cursor } from '$lib/domain/entities/Cursor';

function createRoomStore() {
	const strokes = writable<Stroke[]>([]);
	const cursors = writable<Record<string, Cursor>>({});

	return {
		strokes,
		cursors,

		setStrokes: (data: Stroke[]) => strokes.set(data),

		addStroke: (stroke: Stroke) => strokes.update((s) => [...s, stroke]),

		removeStroke: (strokeId: string) =>
			strokes.update((s) => s.filter((st) => st.strokeId !== strokeId)),

		clear: () => strokes.set([]),

		updateCursor: (userId: string, cursor: Cursor) =>
			cursors.update((c) => ({ ...c, [userId]: cursor }))
	};
}

export const roomStore = createRoomStore();
