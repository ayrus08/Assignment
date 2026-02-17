<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	let token = '';

	onMount(() => {
		token = localStorage.getItem('token') || '';
		if (!token) {
			goto('/login');
		} else {
			goto('/room/demo');
		}
	});
</script>
