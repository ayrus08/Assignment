<script lang="ts">
	export let canvasRef: HTMLCanvasElement;

	export let WIDTH: number;
	export let HEIGHT: number;

	export let startDraw: (e: MouseEvent) => void;
	export let drawMove: (e: MouseEvent) => void;
	export let endDraw: () => void;
	export let handleMouseMove: (e: MouseEvent) => void;

	function move(e: MouseEvent) {
		drawMove(e);
		handleMouseMove(e);
	}
</script>

<canvas
	bind:this={canvasRef}
	width={WIDTH}
	height={HEIGHT}
	on:mousedown={startDraw}
	on:mousemove={move}
	on:mouseup={endDraw}
	on:mouseleave={endDraw}
></canvas>

<style>
	canvas {
		border: 1px solid #b61111;
		background: white;
	}
</style>
