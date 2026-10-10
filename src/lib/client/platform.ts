/** A system notification through Web Notifications, once the person has allowed them. */
export async function notify(title: string, body: string) {
	if ('Notification' in window && Notification.permission === 'granted') {
		new Notification(title, { body });
	}
}
