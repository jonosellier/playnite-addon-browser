import { parse } from 'yaml';
import { type Addon, type AddonManifest, type AddonResponse, AddonType } from './addon.type';
import { ADDON_API_URL } from './consts';

let addons: Addon[];
let addonMap = new Map<string, Addon>();

async function loadAddons() {
	const res = await fetch(ADDON_API_URL);
	const data: AddonResponse = await res.json();
	addons = data.data
		.map((addon) => {
			return {
				...addon,
				type: addon.type ?? 0,
				tags: addon.tags ?? [],
				tagString: addon.tags?.join(' ') ?? '',
				addonType: AddonType(addon.type ?? 0)
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
	addonMap = new Map<string, Addon>(addons.map((addon) => [addon.addonId, addon]));
}

export async function getAddons(): Promise<Addon[]> {
	if (!addons) {
		await loadAddons();
	}
	return addons;
}

export async function getAddon(addonId: string): Promise<Addon | undefined> {
	if (!addons) {
		await loadAddons();
	}
	return addonMap.get(addonId);
}

export async function getAddonManifest(addonId: string): Promise<AddonManifest> {
	const addon = await getAddon(addonId);
	if (!addon) {
		throw new Error(`Addon ${addonId} not found`);
	}
	const res = await fetch(addon.installerManifestUrl);
	if (!res.ok) {
		throw new Error(`Failed to fetch addon manifest: ${res.statusText}`);
	}
	const manifest: AddonManifest = parse(await res.text());
	// sort packages by semver
	manifest.Packages.sort((a, b) => {
		const aVersion = a.Version.toString().split('.').map(Number).concat([0, 0, 0, 0]);
		const bVersion = b.Version.toString().split('.').map(Number).concat([0, 0, 0, 0]);
		if (aVersion[0] !== bVersion[0]) {
			return bVersion[0] - aVersion[0];
		}
		if (aVersion[1] !== bVersion[1]) {
			return bVersion[1] - aVersion[1];
		}
		if (aVersion[2] !== bVersion[2]) {
			return bVersion[2] - aVersion[2];
		}
		if (aVersion[3] !== bVersion[3]) {
			return bVersion[3] - aVersion[3];
		}
		return 0;
	});
	return manifest;
}
