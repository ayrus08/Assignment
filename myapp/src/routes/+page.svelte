<script>
	let dark = $state(false);

	function toggleTheme() {
		dark = !dark;
		if (dark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
</script>

<div class="page">
	<header class="header">
		<h1>Dashboard</h1>
		<button class="theme-btn" onclick={toggleTheme}> Toggle theme </button>
	</header>

	<section class="grid">
		<div class="card">
			<h2>Users</h2>
			<p>1,240 active users</p>
			<button class="primary">View</button>
		</div>

		<div class="card">
			<h2>Revenue</h2>
			<p>$24,000</p>
			<button class="primary">Analytics</button>
		</div>

		<div class="card form-card">
			<h2>Add user</h2>

			<input placeholder="Name" />
			<input placeholder="Email" />
			<button class="primary full">Create</button>
		</div>
	</section>
</div>
