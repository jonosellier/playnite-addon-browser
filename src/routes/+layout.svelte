<script>
	let { children } = $props();
	import '../app.css';
</script>

<div class="bg-slate-950 text-slate-100 min-h-dvh">
	{@render children()}
</div>
