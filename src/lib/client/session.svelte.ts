import { sol, type SolSchemas } from './api.js';

export type Me = SolSchemas['schemas']['Me'];

/** Who is signed in to Sol's web app. */
class Session {
	me = $state<Me | null>(null);

	/** Loads the session; says where to go when there is none. */
	async load(): Promise<'ok' | 'login' | 'setup'> {
		const { data, response } = await sol.GET('/api/sol/me');
		if (data) {
			this.me = data;
			return 'ok';
		}
		if (response.status !== 401) throw new Error(`Sol answered ${response.status}`);
		const setup = await sol.GET('/api/sol/setup');
		return setup.data?.needed ? 'setup' : 'login';
	}

	async signOut() {
		await sol.POST('/api/sol/logout');
		this.me = null;
	}
}

export const session = new Session();
