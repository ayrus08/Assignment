<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let role = $state('');
	let email = $state('');

	onMount(() => {
		role = localStorage.getItem('role') || '';
		email = localStorage.getItem('email') || '';
	});

	function logout() {
		localStorage.clear();
		role = '';
		email = '';
		goto('/login');
	}
</script>

<nav class="navbar">
	<div class="left">
		<strong>Whiteboard</strong>
	</div>

	<div class="right">
		{#if email}
			<!-- <span>{email} ({role})</span> -->
			<button onclick={logout}>Logout</button>
		{/if}
	</div>
</nav>
<slot />

<style>
	.navbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 16px;
		background: #111;
		color: white;
	}

	button {
		margin-left: 10px;
		padding: 6px 10px;
		cursor: pointer;
	}
</style>
