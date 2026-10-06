import { sol, type SolSchemas } from './api.js';

export type Me = SolSchemas['schemas']['Me'];
export type AppInfo = SolSchemas['schemas']['AppInfo'];

/** Who is signed in and which worlds Sol can reach. Shared by every app. */
class Session {
	me = $state<Me | null>(null);
	apps = $state<AppInfo[]>([]);

	/** Loads the session; says where to go when there is none. */
	async load(): Promise<'ok' | 'login' | 'setup'> {
		const { data, response } = await sol.GET('/api/sol/me');
		if (data) {
			this.me = data;
			await this.refreshApps();
			return 'ok';
		}
		if (response.status !== 401) throw new Error(`Sol answered ${response.status}`);
		const setup = await sol.GET('/api/sol/setup');
		return setup.data?.needed ? 'setup' : 'login';
	}

	async refreshApps() {
		const { data } = await sol.GET('/api/sol/apps');
		if (data) this.apps = data;
	}

	async signOut() {
		await sol.POST('/api/sol/logout');
		this.me = null;
		this.apps = [];
	}

	isUp(id: string) {
		return this.apps.some((app) => app.id === id && app.status === 'up');
	}

	/** Worlds that are answering and have screens to open. */
	get open() {
		return this.apps.filter((app) => app.status === 'up' && app.manifest?.ui);
	}

	/** Event types any app asked to raise a notification for. */
	get notifying() {
		return new Set(
			this.apps.flatMap((app) =>
				(app.manifest?.events?.emits ?? []).filter((e) => e.notify).map((e) => e.type)
			)
		);
	}
}

export const session = new Session();
