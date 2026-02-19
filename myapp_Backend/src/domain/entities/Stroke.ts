export type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  strokeId: string;
  userId: string;
  points: Point[];
  color: string;
  width: number;
};
