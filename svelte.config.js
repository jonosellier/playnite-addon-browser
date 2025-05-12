import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '200.html', // for SPA routing
			precompress: false,
			strict: true
		}),
		paths: {
			base: process.env.BASE_PATH || ''
		}
	}
};

export default config;
