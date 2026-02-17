<script lang="ts">
	import { onMount } from 'svelte';
	import { connect, StringCodec, type NatsConnection } from 'nats.ws';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let userID = '';
	let roomId = page.params.id;
	let token = '';
	let role = '';

	let lastSent = 0;
	type Cursor = {
		x: number;
		y: number;
		role: 'admin' | 'member' | 'viewer';
	};

	let cursors: Record<string, Cursor> = {};

	let nc: NatsConnection;

	const sc = StringCodec();

	onMount(() => {
		token = localStorage.getItem('token') || '';
		role = localStorage.getItem('role') || '';
		const stored = localStorage.getItem('userId') || '';
		if (!token) {
			goto('/login');
			return;
		}

		userID = stored;
		let isMounted = true;

		(async () => {
			nc = await connect({
				servers: 'ws://localhost:8080'
			});

			if (!isMounted) return;

			console.log('connected to NATS');

			const sub = nc.subscribe(`room.${roomId}.draw`);
			const eraseSub = nc.subscribe(`room.${roomId}.erase`);
			const clearSub = nc.subscribe(`room.${roomId}.clear`);
			const cursorSub = nc.subscribe(`room.${roomId}.cursor`);

			(async () => {
				for await (const m of sub) {
					const stroke = JSON.parse(sc.decode(m.data));

					if (stroke.userID === userID) continue;

					strokes.push(stroke);
					drawAll();
				}
			})();

			// erase listener
			(async () => {
				for await (const m of eraseSub) {
					const msg = JSON.parse(sc.decode(m.data));
					if (msg.userID === userID) continue;

					strokes = strokes.filter((s) => s.strokeId !== msg.strokeId);
					drawAll();
				}
			})();

			(async () => {
				for await (const m of clearSub) {
					strokes = [];
					drawAll();
				}
			})();

			(async () => {
				for await (const m of cursorSub) {
					const data = JSON.parse(sc.decode(m.data));

					if (data.userID === userID) continue;
					cursors[data.userId] = { x: data.x, y: data.y, role: data.role };
				}
			})();
		})();

		return () => {
			isMounted = false;
			nc?.close();
		};
	});

	async function loadHistory() {
		const res = await fetch(`http://localhost:3001/api/rooms/${roomId}/strokes`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!res.ok) {
			console.error('Auth failed');
			goto('/login');
			return;
		}

		const data = await res.json();

		strokes = data;
		drawAll();
	}

	type Stroke = {
		strokeId: string;
		points: Point[];
		color: string;
		width: number;
		userID: string;
	};

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let drawing = false;

	type Point = {
		x: number;
		y: number;
	};

	let currentStroke: Point[] = [];

	let tool: 'pen' | 'eraser' = 'pen';

	// all strokes in memory (source of truth)

	let strokes: Stroke[] = [];

	const WIDTH = 2000;
	const HEIGHT = 1500;

	onMount(async () => {
		ctx = canvas.getContext('2d')!;
		drawAll();

		await loadHistory(); // 1️⃣ load from MongoDB on mount
	});

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
		drawPreview();
	}

	function endDraw() {
		if (!drawing) return;
		drawing = false;

		if (currentStroke.length < 2) return;

		const stroke = {
			strokeId: crypto.randomUUID(),
			points: [...currentStroke],
			color: '#000000',
			userID,
			width: 2
		};

		nc.publish(`room.${roomId}.draw`, sc.encode(JSON.stringify(stroke)));

		strokes.push(stroke);
		drawAll();
	}

	function addPoint(e: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		currentStroke.push({ x, y });
	}

	function drawPreview() {
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
	}

	function drawAll() {
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, WIDTH, HEIGHT);

		for (const stroke of strokes) {
			drawStroke(stroke);
		}
	}

	function drawStroke(stroke: Stroke) {
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
	}

	function handleErase(e: MouseEvent) {
		if (role === 'viewer') return;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const hit = findStrokeAt(x, y);

		if (!hit) return;

		strokes = strokes.filter((s) => s.strokeId !== hit.strokeId);
		drawAll();

		nc.publish(
			`room.${roomId}.erase`,
			sc.encode(
				JSON.stringify({
					strokeId: hit.strokeId,
					userID
				})
			)
		);
	}

	function findStrokeAt(x: number, y: number) {
		const threshold = 10;

		for (const stroke of strokes) {
			const pts = stroke.points;

			for (let i = 0; i < pts.length - 1; i++) {
				const p1 = pts[i];
				const p2 = pts[i + 1];

				const dist = distanceToSegment(x, y, p1, p2);

				if (dist < threshold) {
					return stroke;
				}
			}
		}
		return null;
	}

	function distanceToSegment(px: number, py: number, p1: Point, p2: Point) {
		const x = p1.x;
		const y = p1.y;
		const dx = p2.x - x;
		const dy = p2.y - y;

		if (dx === 0 && dy === 0) {
			return Math.hypot(px - x, py - y);
		}

		const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

		const clamped = Math.max(0, Math.min(1, t));

		const closestX = x + clamped * dx;
		const closestY = y + clamped * dy;

		return Math.hypot(px - closestX, py - closestY);
	}

	async function clearCanvas() {
		const token = localStorage.getItem('token');

		await fetch(`http://localhost:3001/api/rooms/${roomId}/clear`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
	}

	function handleMouseMove(e: MouseEvent) {
		const now = Date.now();
		if (now - lastSent < 10) return;

		lastSent = now;

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		nc.publish(
			`room.${roomId}.cursor`,
			sc.encode(
				JSON.stringify({
					userID,
					role,
					x,
					y
				})
			)
		);
	}
</script>

<div class={role == 'viewer' ? 'toolbar-off' : 'toolbar'}>
	<button on:click={() => (tool = 'pen')} disabled={role == 'viewer'}>Pen</button>
	<button on:click={() => (tool = 'eraser')} disabled={role == 'viewer'}>Eraser</button>

	{#if role === 'admin'}
		<button on:click={clearCanvas}>Clear Canvas</button>
	{/if}
</div>

<!-- canvas wrapper -->
<div class="canvas-wrapper">
	<canvas
		bind:this={canvas}
		width={WIDTH}
		height={HEIGHT}
		on:mousedown={startDraw}
		on:mousemove={(e) => {
			drawMove(e);
			handleMouseMove(e);
		}}
		on:mouseup={endDraw}
		on:mouseleave={endDraw}
	></canvas>

	<!-- cursor overlay -->
	<div class="cursor-layer">
		{#each Object.entries(cursors) as [id, c]}
			<div class="cursor" style="left:{c.x}px; top:{c.y}px">
				{c.role}
			</div>
		{/each}
	</div>
</div>

<style>
	.canvas-wrapper {
		position: relative;
		width: 2000px;
		height: 1500px;
	}

	.cursor-layer {
		position: absolute;
		top: 0;
		left: 0;
		width: 2000px;
		height: 1500px;
		pointer-events: none;
	}

	.cursor {
		position: absolute;
		background: red;
		color: white;
		font-size: 10px;
		padding: 2px 4px;
		border-radius: 4px;
		transform: translate(-50%, -50%);
		white-space: nowrap;
	}

	canvas {
		border: 1px solid #b61111;
		background: white;
	}

	.toolbar {
		margin: 10px;
	}

	.toolbar-off {
		margin: 10px;
		opacity: 0.5;
	}
</style>
