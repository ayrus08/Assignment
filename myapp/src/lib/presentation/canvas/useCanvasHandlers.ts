import { get, type Writable } from 'svelte/store';
import { drawPreview, findStrokeAt } from './canvasUtils';
import type { Point, Stroke } from '$lib/domain/entities/Stroke';

export type CanvasHandlers = {
	startDraw: (e: MouseEvent) => void;
	drawMove: (e: MouseEvent) => void;
	endDraw: () => void;
	handleMouseMove: (e: MouseEvent) => void;
	setTool: (t: 'pen' | 'eraser') => void;
};

type CreateHandlersParams = {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	role: string;
	userID: string;
	roomId: string;
	strokes: Writable<Stroke[]>;
	roomController: {
		sendStroke: (roomId: string, stroke: Stroke) => void;
		eraseStroke: (roomId: string, strokeId: string, userID: string) => void;
		sendCursor: (roomId: string, data: any) => void;
	};
};

export function createCanvasHandlers({
	canvas,
	ctx,
	role,
	userID,
	roomId,
	strokes,
	roomController
}: CreateHandlersParams): CanvasHandlers {
	let drawing = false;
	let currentStroke: Point[] = [];
	let tool: 'pen' | 'eraser' = 'pen';
	let lastSent = 0;

	function setTool(t: 'pen' | 'eraser') {
		tool = t;
	}

	function startDraw(e: MouseEvent) {
		if (role === 'viewer') return;

		if (tool === 'eraser') {
			handleErase(e);
			return;
		}

		drawing = true;
		currentStroke = [];
		addPoint(e);
	}

	function drawMove(e: MouseEvent) {
		if (!drawing) return;
		addPoint(e);
		drawPreview(ctx, currentStroke);
	}

	function endDraw() {
		if (!drawing) return;
		drawing = false;

		if (currentStroke.length < 2) return;

		const stroke: Stroke = {
			strokeId: crypto.randomUUID(),
			points: [...currentStroke],
			color: '#000000',
			userID,
			width: 2
		};

		roomController.sendStroke(roomId, stroke);
	}

	function addPoint(e: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		currentStroke.push({ x, y });
	}

	function handleErase(e: MouseEvent) {
		if (role === 'viewer') return;

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const hit = findStrokeAt(get(strokes), x, y);
		if (!hit) return;

		roomController.eraseStroke(roomId, hit.strokeId, userID);
	}

	function handleMouseMove(e: MouseEvent) {
		const now = Date.now();
		if (now - lastSent < 10) return;
		lastSent = now;

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		roomController.sendCursor(roomId, {
			userID,
			role,
			x,
			y
		});
	}

	return {
		startDraw,
		drawMove,
		endDraw,
		handleMouseMove,
		setTool
	};
}
