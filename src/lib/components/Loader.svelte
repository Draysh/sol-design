<!-- An arc turning slowly, for the moments before a screen has data. -->
<script lang="ts">
	interface Props {
		label?: string;
		size?: number;
	}

	let { label = 'Loading', size = 32 }: Props = $props();
</script>

<svg class="loader" width={size} height={size} viewBox="0 0 32 32" role="img" aria-label={label}>
	<circle cx="16" cy="16" r="12" fill="none" stroke="rgb(255 255 255 / 0.14)" stroke-width="1"></circle>
	<path d="M16 4a12 12 0 0 1 12 12" fill="none" stroke="var(--text)" stroke-width="1.2"></path>
	<circle cx="16" cy="16" r="1.4" fill="var(--world)"></circle>
</svg>

<style>
	.loader {
		animation: turn 1.4s linear infinite;
	}

	@keyframes turn {
		to {
			rotate: 1turn;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.loader {
			animation-duration: 6s;
		}
	}
</style>
