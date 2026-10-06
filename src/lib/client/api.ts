import createClient from 'openapi-fetch';
import type { components, paths } from './sol.js';

export type { components as SolSchemas, paths as SolPaths } from './sol.js';
export type WidgetView = components['schemas']['WidgetView'];

/**
 * Sol's own API. Every call is same-origin, so Sol's session cookie rides
 * along; Sol adds the token an app needs when it proxies `/api/<app>/…`.
 */
export const sol = createClient<paths>({ baseUrl: '' });

/** A typed client for one app's API, e.g. `appClient<TerraPaths>('terra')`. */
export function appClient<Paths extends {}>(app: string) {
	return createClient<Paths>({ baseUrl: `/api/${app}` });
}

/** The `message` of an API error body, or a fallback. */
export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
	if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
		return error.message;
	}
	return fallback;
}
