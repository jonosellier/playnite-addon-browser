<script lang="ts">
	import type { Screenshot } from './addon.type';
	const { imgs, index = 0 }: { imgs: Screenshot[]; index?: number } = $props();
	let currentIndex = $state(index);
	let currentImg = $derived(imgs[currentIndex]);
	$effect(() => {
		document.getElementById(`thumbnail-${currentIndex}`)?.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest',
			inline: 'nearest'
		});
	});
</script>

<div class="max-w-7xl mx-auto px-4">
	<div class="relative img-holder">
		<button
			class="nav-arrow absolute start-0 bg-slate-950/65 m-3 rounded-2xl w-12 h-12 text-center"
			disabled={currentIndex === 0}
			onclick={() => (currentIndex = currentIndex - 1)}
		>
			🞀
		</button>
		<button
			class="nav-arrow absolute end-0 bg-slate-950/65 m-3 rounded-2xl w-12 h-12 text-center"
			disabled={currentIndex === imgs.length - 1}
			onclick={() => (currentIndex = currentIndex + 1)}
		>
			🞂
		</button>
		<img
			class="w-full object-contain rounded-lg h-188 bg-black/50 p-4 border border-slate-900"
			src={currentImg.image}
			alt={`Image ${currentIndex + 1} of ${imgs.length}`}
		/>
	</div>
	{#if imgs.length > 1}
		<div class="flex justify-center mt-6 flex-nowrap overflow-x-auto">
			{#each imgs as img, i}
				<button
					class="rounded-sm mr-2 border-2 transition-colors duration-200"
					class:border-orange-500={currentIndex === i}
					class:border-slate-600={currentIndex !== i}
					onclick={() => (currentIndex = i)}
					id={`thumbnail-${i}`}
				>
					<img
						src={img.thumbnail}
						alt={`Image ${i + 1} of ${imgs.length}`}
						class="w-24 h-24 object-cover rounded-sm"
					/>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.nav-arrow {
		top: 50%;
		transform: translateY(-50%);
		opacity: 0;
		transition: 200ms;
	}

	.img-holder:hover .nav-arrow:not(:disabled) {
		opacity: 1;
	}
</style>
