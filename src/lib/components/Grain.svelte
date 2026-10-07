<!--
	Film grain over the whole screen. Shell adds it; standalone pages add it
	themselves. The texture is black specks of varying alpha: nothing to see
	over pure black, a fine grain over photographs and light type. It needs
	no blend mode, so it is one layer the compositor lays over everything,
	and scrolling under it costs nothing.
-->
<script lang="ts">
	import grain from '../assets/grain.png';
</script>

<div class="grain" style:background-image="url({grain})" aria-hidden="true"></div>

<style>
	.grain {
		position: fixed;
		inset: 0;
		z-index: 100;
		opacity: 0.14;
		pointer-events: none;
		contain: strict;
		will-change: transform;
	}
</style>
