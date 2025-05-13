<script lang="ts">
	import { page } from '$app/stores';
	import { getAddon, getAddonManifest, getAddons } from '$lib/addon.data';
	import type { Addon, AddonManifest, Package } from '$lib/addon.type';
	import Carousel from '$lib/carousel.svelte';
	import type { FuseResult } from 'fuse.js';
	import Fuse from 'fuse.js';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let relatedAddons: Addon[] = $state([]);
	let addon: Addon | undefined = $state();
	let manifest: AddonManifest | undefined = $state();
	let latestPackage: Package | undefined = $state();

	let addonSearch: Fuse<Addon> | undefined;

	let extraButtons: HTMLDivElement | undefined = $state();

	let showBtns = $state(false);

	let searchTerm = $state('');

	let ghProfile = $derived(
		!!addon
			? (Object.entries(addon.links ?? {}).find(
					([k, v]) =>
						k.toLocaleLowerCase().includes('github') ||
						v.toLocaleLowerCase().match(/(github\.com\/[A-Za-z0-9-]+)\/.+/)
				) ?? [[]])[1]?.replace(/(github\.com\/[A-Za-z0-9-]+)\/.+/, '$1')
			: undefined
	);

	let filteredAddons: FuseResult<Addon>[] = $derived(
		!!searchTerm && addonSearch
			? addonSearch.search(searchTerm)
			: relatedAddons.map((val, index) => ({
					item: Object.assign(val, {}),
					matches: [],
					score: 1,
					refIndex: index
				}))
	);

	// Use effect() to run code when dependencies change
	$effect(() => {
		// This will automatically re-run when $page.params.id changes
		const id = $page.params.id;
		updateData(id);
	});

	onMount(() => {
		window.addEventListener('scroll', checkScroll);
		checkScroll();
	});

	function checkScroll() {
		if (!extraButtons) return;
		const elementVisible = 150;
		showBtns = document.documentElement.scrollTop > elementVisible;
	}

	async function updateData(addonId: string) {
		addon = await getAddon(addonId);
		if (addon) {
			relatedAddons = (await getAddons()).filter((a) => a.type === addon?.type);
			manifest = await getAddonManifest(addonId);
			latestPackage = manifest?.Packages[0];
			addonSearch = new Fuse(relatedAddons, {
				keys: ['name', 'description', 'tagString', 'addonType']
			});
		}
	}

	function timeSince(dateStr: string) {
		const d = new Date(dateStr);
		const now = new Date();
		const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
		const year = Math.floor(seconds / 31536000);
		if (year >= 1) {
			return d.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		}
		const month = Math.floor(seconds / 2592000);
		if (month > 1) {
			return month + ' months ago';
		}
		if (month === 1) {
			return month + ' month ago';
		}
		const day = Math.floor(seconds / 86400);
		if (day > 1) {
			return day + ' days ago';
		}
		if (day === 1) {
			return 'Yesterday';
		}
		return 'Today';
	}
</script>

<div class="flex justify-between">
	<aside class="max-w-lg w-100 grow-0 hidden md:block h-dvh overflow-y-auto px-2 sticky top-0">
		<a
			href={base + '/'}
			class="inline-block bg-slate-900 px-2 py-1 rounded hover:bg-slate-800 m-2 my-4"
			>🡐 All Addons</a
		>
		<div class="sticky top-0">
			<input
				type="text"
				bind:value={searchTerm}
				placeholder="Search for related addons..."
				class="w-full p-2 border border-slate-700 bg-slate-900 text-slate-50 rounded my-2"
			/>
		</div>
		{#each filteredAddons as filterAddon}
			<a
				class="px-4 border-b border-slate-900 block hover:bg-slate-900 transition-colors duration-200"
				href={filterAddon.item.addonId !== addon?.addonId
					? `${base}/${filterAddon.item.addonId}`
					: undefined}
				class:text-orange-500={filterAddon.item.addonId === addon?.addonId}
				class:bg-slate-800={filterAddon.item.addonId === addon?.addonId}
			>
				<div class="flex justify-between items-center py-2">
					<div class="flex items-center">
						<img
							src={filterAddon.item.iconUrl ??
								'https://raw.githubusercontent.com/Jeshibu/PlayniteExtensions/main/source/ExtraEmulatorProfiles/icon.png'}
							alt=""
							width="16"
							height="16"
							class="me-4"
						/>
						<h2 class="text-md font-bold inline-block">{filterAddon.item.name}</h2>
					</div>
				</div>
			</a>
		{/each}
	</aside>
	<main class="flex-grow pt-4">
		{#if addon}
			<div class="flex justify-between max-w-4xl mx-auto items-center">
				<div class="flex items-center">
					<img
						src={addon.iconUrl ??
							'https://raw.githubusercontent.com/Jeshibu/PlayniteExtensions/main/source/ExtraEmulatorProfiles/icon.png'}
						alt={addon.name}
						class="mb-4 me-6"
						width="52"
						height="52"
					/>
					<h1 class="text-5xl font-bold mb-4">{addon.name}</h1>
				</div>
				<a
					href={ghProfile}
					class="bg-black/10 border border-slate-900 rounded-full py-1 text-lg flex items-center"
				>
					{#if ghProfile}
						<img
							src={`${ghProfile}.png`}
							alt={addon.author}
							class="rounded-full ms-1 border border-slate-700"
							width="32"
							height="32"
						/>
					{/if}
					<span class="mx-3">{addon.author}</span>
				</a>
			</div>
			<p class="max-w-4xl mx-auto my-6">
				<span
					class="inline-block bg-slate-600 text-slate-50 text-sm px-2 py-1 rounded-full mr-2 uppercase font-bold tracking-widest"
				>
					{addon.addonType}
				</span>
				{#each addon.tags as tag}
					<span
						class="inline-block bg-slate-800 text-slate-200 text-sm px-2 py-1 rounded-full mr-2"
					>
						{tag}
					</span>
				{/each}
			</p>
			<div>
				<div class="max-w-4xl flex mx-auto items-center py-4">
					<a
						href={`playnite://playnite/installaddon/${addon.addonId}`}
						class="bg-orange-700 hover:bg-orange-500 text-slate-50 text-2xl py-2 px-6 rounded-xl"
						>Add to Playnite</a
					>
					<a
						href={latestPackage?.PackageUrl}
						class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-2xl py-2 px-6 rounded-xl ml-4"
						target="_blank"
						rel="noopener noreferrer">Download</a
					>
				</div>
			</div>
			<hr class="mt-6 mb-20 border-slate-900 border-b max-w-4xl mx-auto" />
			{#if addon.screenshots && addon.screenshots.length > 0}
				<Carousel imgs={addon.screenshots} index={0} />
			{/if}
			<section class="my-20 max-w-4xl mx-auto">
				{#each (addon.description ?? '').split('\n').filter(Boolean) as d}
					<p class="my-1 text-lg text-justify">{d}</p>
				{/each}
			</section>
			<h2 class="text-4xl max-w-4xl mx-auto mb-6 text-orange-500">Additional Links</h2>
			<p class="mb-4 max-w-4xl mx-auto">
				{#each Object.entries(addon.links ?? {}) as [title, link]}
					<a
						href={link}
						class="inline-block bg-slate-900 hover:bg-slate-800 text-slate-200 text-xl px-4 py-1 rounded-full mr-4 mb-2"
						target="_blank"
						rel="noopener noreferrer">{title}</a
					>
				{/each}
			</p>
			{#if manifest}
				<section class="max-w-4xl mx-auto mt-20">
					<h2 class="mb-6 text-orange-500 text-4xl">All Versions</h2>
					<ol>
						{#each manifest.Packages as p, idx}
							<li class="border-b border-slate-900 mb-4">
								<div class="flex items-center mb-4">
									<a
										class="text-slate-300 text-3xl flex-grow-1"
										href={`#${p.Version.toString().replaceAll('.', '-')}`}
										><h3 id={p.Version.toString().replaceAll('.', '-')}>
											{p.Version}
										</h3></a
									>
									{#if idx === 0}
										<span
											class="bg-emerald-800 text-emerald-200 text-sm px-2 py-1 rounded-full me-6"
											>Latest Version</span
										>
									{/if}
									<span class="bg-slate-800 text-slate-200 text-sm px-2 py-1 rounded-full"
										>{timeSince(p.ReleaseDate)}</span
									>

									<a
										href={p.PackageUrl}
										class="text-slate-50 px-2 py-1 rounded ms-6"
										class:bg-slate-600={idx > 0}
										class:hover:bg-slate-500={idx > 0}
										class:bg-orange-700={idx === 0}
										class:hover:bg-orange-600={idx === 0}>Download</a
									>
								</div>
								{#if p.Changelog}
									<ul class="list-disc marker:text-slate-500 ps-8 pb-4">
										{#each p.Changelog as change}
											<li class="text-slate-200 text-lg my-4">{change}</li>
										{/each}
									</ul>
								{/if}
							</li>
						{/each}
					</ol>
				</section>
			{/if}
		{:else}
			<p>Loading...</p>
		{/if}
	</main>
	<div class="max-w-lg w-100 shrink-0 hidden 2xl:block">
		{#if addon}
			<div
				class="sticky top-0 z-0 addnl-btns duration-200 transition-all py-4 px-4"
				bind:this={extraButtons}
				class:opacity-0={!showBtns}
				class:translate-y-10={!showBtns}
			>
				<div class="flex justify-between items-center py-2">
					<h1 class="text-2xl font-bold mb-4">{addon.name}</h1>
					<img
						src={addon.iconUrl ??
							'https://raw.githubusercontent.com/Jeshibu/PlayniteExtensions/main/source/ExtraEmulatorProfiles/icon.png'}
						alt={addon.name}
						class="mb-4"
						width="32"
						height="32"
					/>
				</div>
				<div class="py-4">
					<a
						href={`playnite://playnite/installaddon/${addon.addonId}`}
						class="w-full block bg-orange-700 hover:bg-orange-500 text-slate-50 text-2xl py-2 px-6 rounded-xl text-center my-4"
						>Add to Playnite</a
					>
					<a
						href={latestPackage?.PackageUrl}
						class="w-full block bg-slate-800 hover:bg-slate-700 text-slate-200 text-2xl py-2 px-6 rounded-xl text-center my-4"
						target="_blank"
						rel="noopener noreferrer">Download</a
					>
				</div>
			</div>
		{/if}
	</div>
</div>
