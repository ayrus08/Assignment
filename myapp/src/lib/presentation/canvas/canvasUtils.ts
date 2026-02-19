import type { Stroke } from '$lib/domain/entities/Stroke';

export const drawAll = (
	ctx: CanvasRenderingContext2D,
	strokes: Stroke[],
	width: number,
	height: number
) => {
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, width, height);

	for (const stroke of strokes) {
		drawStroke(ctx, stroke);
	}
};

export const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
	const pts = stroke.points;
	if (pts.length < 2) return;

	ctx.beginPath();
	ctx.moveTo(pts[0].x, pts[0].y);

	for (let i = 1; i < pts.length; i++) {
		ctx.lineTo(pts[i].x, pts[i].y);
	}

	ctx.strokeStyle = stroke.color;
	ctx.lineWidth = stroke.width;
	ctx.lineCap = 'round';
	ctx.stroke();
};

export const drawPreview = (
	ctx: CanvasRenderingContext2D,
	currentStroke: { x: number; y: number }[]
) => {
	const len = currentStroke.length;
	if (len < 2) return;

	const p1 = currentStroke[len - 2];
	const p2 = currentStroke[len - 1];

	ctx.beginPath();
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	ctx.stroke();
};

export const findStrokeAt = (strokes: Stroke[], x: number, y: number): Stroke | null => {
	const threshold = 10;

	for (const stroke of strokes) {
		const pts = stroke.points;

		for (let i = 0; i < pts.length - 1; i++) {
			const dist = distanceToSegment(x, y, pts[i], pts[i + 1]);
			if (dist < threshold) return stroke;
		}
	}

	return null;
};

const distanceToSegment = (
	px: number,
	py: number,
	p1: { x: number; y: number },
	p2: { x: number; y: number }
) => {
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;

	if (dx === 0 && dy === 0) {
		return Math.hypot(px - p1.x, py - p1.y);
	}

	const t = ((px - p1.x) * dx + (py - p1.y) * dy) / (dx * dx + dy * dy);
	const clamped = Math.max(0, Math.min(1, t));

	const cx = p1.x + clamped * dx;
	const cy = p1.y + clamped * dy;

	return Math.hypot(px - cx, py - cy);
};
