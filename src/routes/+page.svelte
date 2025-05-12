<script lang="ts">
	import { type Addon } from '$lib/addon.type';
	import Fuse, { type FuseResult } from 'fuse.js';
	import { getAddons } from '$lib/addon.data';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let addons = $state([] as Addon[]);
	let addonSearch = new Fuse(addons, {
		keys: ['name', 'description', 'tagString']
	});

	let show0 = $state(true);
	let show1 = $state(true);
	let show2 = $state(true);
	let show3 = $state(true);
	let show4 = $state(true);

	let show = $derived([show0, show1, show2, show3, show4]);

	let searchTerm = $state('');

	let filteredAddons: FuseResult<Addon>[] = $derived(
		(!!searchTerm
			? addonSearch.search(searchTerm)
			: addons.map((val, index) => ({
					item: Object.assign(val, {}),
					matches: [],
					score: 1,
					refIndex: index
				}))
		).filter((a) => show[a.item.type ?? 2])
	);

	onMount(async () => {
		addons = await getAddons();
		addonSearch = new Fuse(addons, {
			keys: ['name', 'description', 'tagString', 'addonType']
		});
	});
</script>

<main class="mx-auto max-w-3xl py-4">
	<input
		type="text"
		bind:value={searchTerm}
		placeholder="Search for addons..."
		class="w-full p-2 border border-slate-700 bg-slate-900 text-slate-50 rounded text-2xl p-4"
	/>
	<div class="flex mt-4 mb-8">
		Show
		<label
			for="toggleLib"
			class="cursor-pointer ms-2 px-2 rounded-full border hover:border-orange-600 toggle"
			class:toggle-active={show0}
		>
			<input bind:checked={show0} type="checkbox" name="" id="toggleLib" />
			Library
		</label>
		<label
			for="toggleMeta"
			class="cursor-pointer ms-2 px-2 rounded-full border hover:border-orange-600 toggle"
			class:toggle-active={show1}
		>
			<input bind:checked={show1} type="checkbox" name="" id="toggleMeta" />
			Metadata
		</label>
		<label
			for="toggleGeneric"
			class="cursor-pointer ms-2 px-2 rounded-full border hover:border-orange-600 toggle"
			class:toggle-active={show2}
		>
			<input bind:checked={show2} type="checkbox" name="" id="toggleGeneric" />
			Generic
		</label>
		<label
			for="toggleDesktop"
			class="cursor-pointer ms-2 px-2 rounded-full border hover:border-orange-600 toggle"
			class:toggle-active={show3}
		>
			<input bind:checked={show3} type="checkbox" name="" id="toggleDesktop" />
			Desktop
		</label>
		<label
			for="toggleFullscreen"
			class="cursor-pointer ms-2 px-2 rounded-full border hover:border-orange-600 toggle"
			class:toggle-active={show4}
		>
			<input bind:checked={show4} type="checkbox" name="" id="toggleFullscreen" />
			Fullscreen
		</label>
	</div>
	{#each filteredAddons as addon}
		<a
			class="p-4 border-b border-slate-900 block hover:bg-slate-900 transition-colors duration-200"
			href={`${base}/${addon.item.addonId}`}
		>
			<div class="flex justify-between items-center mb-3">
				<div class="flex items-center">
					<img
						src={addon.item.iconUrl ??
							'https://raw.githubusercontent.com/Jeshibu/PlayniteExtensions/main/source/ExtraEmulatorProfiles/icon.png'}
						alt=""
						width="36"
						height="36"
						class="mr-4"
					/>
					<h2 class="text-xl font-bold inline-block">{addon.item.name}</h2>
				</div>
				<span
					class="inline-block bg-slate-600 text-slate-50 text-sm px-2 py-1 rounded-full mr-2 uppercase font-bold tracking-widest"
				>
					{addon.item.addonType}
				</span>
			</div>
			<p class="my-4">{addon.item.shortDescription}</p>
			{#each addon.item.tags as tag}
				<span class="inline-block bg-slate-800 text-slate-200 text-sm px-2 py-1 rounded-full mr-2"
					>{tag}</span
				>
			{/each}
		</a>
	{/each}

	{#if filteredAddons.length === 0}
		<p class="p-4">No addons found.</p>
	{/if}
</main>

<style lang="postcss">
	@reference "tailwindcss";

	label.toggle > input {
		display: none;
		width: 0;
		height: 0;
		opacity: 0;
		visibility: hidden;
	}

	label.toggle:not(.toggle-active) {
		@apply bg-slate-900 text-slate-200 border-slate-700;
	}

	label.toggle.toggle-active {
		@apply bg-orange-700 text-slate-50 border-transparent;
	}
</style>
