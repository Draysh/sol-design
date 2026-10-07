<!--
	Where an app stands with Sol, in one line at the bottom of the sidebar:
	in sync, sending, or offline with what waits. A dot lights when the
	connection is up. `busy` names other work going on ("Syncing library").

	<LinkStatus online={link.status?.state === 'online'} unsent={link.unsent} />
-->
<script lang="ts">
	interface Props {
		online: boolean;
		/** Changes made here that haven't reached Sol yet. */
		unsent?: number;
		/** What the app is doing right now instead, e.g. `Syncing AniList`. */
		busy?: string | null;
		/** Something wrong beside Sol, e.g. `Navidrome · not answering`. */
		warn?: string | null;
	}

	let { online, unsent = 0, busy = null, warn = null }: Props = $props();

	const line = $derived(
		online
			? busy || (unsent ? `Sending ${unsent}` : 'In sync')
			: unsent
				? `Offline · ${unsent} to send`
				: 'Offline'
	);
	const title = $derived(
		online
			? unsent
				? `${unsent} change${unsent === 1 ? '' : 's'} on the way to Sol`
				: 'Connected to Sol; every change reaches it at once'
			: `Sol can't be reached; ${unsent ? `${unsent} change${unsent === 1 ? ' waits' : 's wait'} here until it can` : 'changes made now wait here until it can'}`
	);
</script>

{#if warn}
	<span class="status warn" title={warn}>{warn}</span>
{/if}
<span class="status" class:on={online} {title}>{line}</span>

<style>
	.status {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		max-width: 100%;
		font-size: var(--text-xs);
		letter-spacing: var(--track-caps);
		text-transform: uppercase;
		color: var(--text-quiet);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.status::before {
		content: '';
		flex: none;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--text-faint);
		transition:
			background var(--fade) var(--ease),
			box-shadow var(--fade) var(--ease);
	}

	.status.on::before {
		background: var(--ok);
		box-shadow: 0 0 8px var(--ok);
	}

	.status.warn::before {
		background: var(--danger);
	}
</style>
