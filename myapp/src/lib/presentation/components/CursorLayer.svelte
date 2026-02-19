<script lang="ts">
	import type { Cursor } from '$lib/domain/entities/Cursor';

	export let cursors: Record<string, Cursor>;
</script>

<div class="cursor-layer">
	{#each Object.entries(cursors) as [id, c]}
		<div class="cursor" style="left:{c.x}px; top:{c.y}px">
			{c.role}
		</div>
	{/each}
</div>

<style>
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
</style>
