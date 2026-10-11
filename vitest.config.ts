import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

// The client's pure helpers, in Node: no browser, no network, no Sol.
export default defineConfig({
	plugins: [svelte()],
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
