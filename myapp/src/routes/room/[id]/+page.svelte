<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import CursorLayer from '$lib/presentation/components/CursorLayer.svelte';
	import { roomStore } from '$lib/presentation/stores/roomStore';
	import { roomController } from '$lib/presentation/controllers/roomController';
	import { drawAll } from '$lib/presentation/canvas/canvasUtils';
	import Canvas from '$lib/presentation/components/canvas.svelte';
	import { createCanvasHandlers } from '$lib/presentation/canvas/useCanvasHandlers';
	import type { CanvasHandlers } from '$lib/presentation/canvas/useCanvasHandlers';

	let userID = '';
	let roomId = page.params.id ?? '';
	let token = '';
	let role = '';
	const WIDTH = 2000;
	const HEIGHT = 1500;
	const { strokes, cursors } = roomStore;
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let handlers!: CanvasHandlers;

	onMount(() => {
		token = localStorage.getItem('token') || '';
		role = localStorage.getItem('role') || '';
		userID = localStorage.getItem('userId') || '';

		if (!token) {
			goto('/login');
			return;
		}

		ctx = canvas.getContext('2d')!;

		handlers = createCanvasHandlers({
			canvas,
			ctx,
			role,
			userID,
			roomId,
			strokes,
			roomController
		});

		const unsub = strokes.subscribe((s) => {
			drawAll(ctx, s, WIDTH, HEIGHT);
		});

		roomController.init(roomId, userID, token);

		return () => {
			unsub();
			roomController.cleanup();
		};
	});

	async function clearCanvas() {
		await roomController.clear(roomId, token);
	}
</script>

<div class={role == 'viewer' ? 'toolbar-off' : 'toolbar'}>
	<button on:click={() => handlers?.setTool('pen')} disabled={role == 'viewer'}> Pen </button>

	<button on:click={() => handlers?.setTool('eraser')} disabled={role == 'viewer'}> Eraser </button>

	{#if role === 'admin'}
		<button on:click={clearCanvas}>Clear Canvas</button>
	{/if}
</div>

<!-- canvas wrapper -->
<div class="canvas-wrapper">
	<Canvas
		bind:canvasRef={canvas}
		{WIDTH}
		{HEIGHT}
		startDraw={handlers?.startDraw}
		drawMove={handlers?.drawMove}
		endDraw={handlers?.endDraw}
		handleMouseMove={handlers?.handleMouseMove}
	/>

	<!-- cursor overlay -->
	<CursorLayer cursors={$cursors} />
</div>

<style>
	.canvas-wrapper {
		position: relative;
		width: 2000px;
		height: 1500px;
	}

	.toolbar {
		margin: 10px;
	}

	.toolbar-off {
		margin: 10px;
		opacity: 0.5;
	}
</style>
