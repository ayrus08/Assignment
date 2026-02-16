<script lang="ts">
	import { goto } from '$app/navigation';
	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function login() {
		error = '';
		loading = true;

		try {
			const res = await fetch('http://localhost:3001/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await res.json();

			if (!res.ok) {
				error = data.error || 'Login failed';
				return;
			}
			console.log('data = ', data);
			// store auth info
			localStorage.setItem('token', data.token);
			localStorage.setItem('role', data.role);
			localStorage.setItem('email', data.email);
			localStorage.setItem('userId', data.userId);

			// redirect
			goto('/room/demo');
		} catch (e) {
			error = 'Server error';
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
