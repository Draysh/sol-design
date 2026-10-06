import createClient from 'openapi-fetch';
import type { components, paths } from './sol.js';

export type { components as SolSchemas, paths as SolPaths } from './sol.js';
export type WidgetView = components['schemas']['WidgetView'];

/**
 * Sol's API, for Sol's own web app. Every call is same-origin, so the session
 * cookie rides along. (Worlds' apps reach Sol from their Rust side with
 * `orbit::client` and a device token instead.)
 */
export const sol = createClient<paths>({ baseUrl: '' });

/** The `message` of an API error body, or a fallback. */
export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
	if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
		return error.message;
	}
	return fallback;
}
