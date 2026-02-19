<script lang="ts">
	import { goto } from '$app/navigation';
	import { loginController } from '$lib/presentation/controllers/loginController';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function login() {
		error = '';
		loading = true;

		try {
			await loginController(email, password);
			goto('/room/demo');
		} catch (e: any) {
			error = e.message || 'Login failed';
		} finally {
			loading = false;
		}
	}
</script>

<h1>Login</h1>

<div class="form">
	<input placeholder="Email" type="email" bind:value={email} />

	<input placeholder="Password" type="password" bind:value={password} />

	<button on:click={login} disabled={loading}>
		{loading ? 'Logging in...' : 'Login'}
	</button>

	{#if error}
		<p class="error">{error}</p>
	{/if}
</div>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 250px;
	}

	input {
		padding: 8px;
		font-size: 14px;
	}

	button {
		padding: 8px;
		cursor: pointer;
	}

	.error {
		color: red;
		font-size: 13px;
	}
</style>
