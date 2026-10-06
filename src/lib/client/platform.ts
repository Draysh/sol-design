/** True inside the Sol desktop app (Tauri), false in a browser. */
export const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

/** A system notification: native in the desktop app, Web Notifications elsewhere. */
export async function notify(title: string, body: string) {
	if (isTauri) {
		const { isPermissionGranted, requestPermission, sendNotification } = await import(
			'@tauri-apps/plugin-notification'
		);
		if ((await isPermissionGranted()) || (await requestPermission()) === 'granted') {
			sendNotification({ title, body });
		}
		return;
	}
	if ('Notification' in window && Notification.permission === 'granted') {
		new Notification(title, { body });
	}
}
