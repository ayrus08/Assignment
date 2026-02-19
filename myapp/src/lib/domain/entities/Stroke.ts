export type Point = { x: number; y: number };

export type Stroke = {
	strokeId: string;
	points: Point[];
	color: string;
	width: number;
	userID: string;
};
