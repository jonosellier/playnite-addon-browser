export type AddonResponse = {
	data: AddonBase[];
};

export type AddonBase = {
	iconUrl?: string;
	screenshots?: Screenshot[];
	type?: number;
	installerManifestUrl: string;
	shortDescription: string;
	name: string;
	addonId: string;
	author: string;
	tags?: string[];
	sourceUrl: string;
	links?: Links;
	description?: string;
};

export type Addon = AddonBase & {
	tags: string[];
	tagString: string;
	addonType: AddonType;
};

export type Screenshot = {
	thumbnail: string;
	image: string;
};

export type Links = {
	[key: string]: string;
};

export type AddonType = 'Library' | 'Metadata' | 'Generic' | 'Desktop Theme' | 'Fullscreen Theme';

export interface AddonManifest {
	Packages: Package[];
	AddonId: string;
}

export interface Package {
	ReleaseDate: string;
	PackageUrl: string;
	Version: number | string;
	RequiredApiVersion: string;
	Changelog: string[];
}

export function AddonType(index: number): AddonType {
	switch (index) {
		case 0:
			return 'Library';
		case 1:
			return 'Metadata';
		case 2:
			return 'Generic';
		case 3:
			return 'Desktop Theme';
		case 4:
			return 'Fullscreen Theme';
		default:
			throw new Error('Invalid index');
	}
}
