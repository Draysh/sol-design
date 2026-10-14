import type { FlavourData } from './look.gen.js';

/*
 * A still graded as one colour, as the apps grade their stills (sol-quick's
 * Duotone and PaperTone): its colours gone, its light kept, each pixel's
 * lightness laid between the flavour's colours. A dark flavour's go black
 * into its light (Neptune's mint, Saturn's gold), a light one's from its
 * light into paper (Terra's blue), one with `tones` through its three
 * (Luna's indigo night lit by the moon's yellow). The ground grades a still
 * once, into a picture of its own, so a graded still costs nothing while
 * the page rests or scrolls.
 */

type Rgb = [number, number, number];

function rgb(hex: string): Rgb {
	const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
	const t = clamp((v - a) / (b - a));
	return t * t * (3 - 2 * t);
};

/**
 * The colour each lightness (0 to 255) takes in `f`'s grade, as 256 × 3
 * bytes; null when the flavour doesn't grade its stills.
 */
export function toneOf(f: FlavourData): Uint8ClampedArray | null {
	if (!f.duotone) return null;
	// The ramp's steepness round its middle and its lift, as the apps' have them.
	const [contrast, brightness] = f.light ? [0.35, 0.02] : f.tones ? [0.2, -0.04] : [0.12, -0.08];
	const pivot = 0.62;
	const lut = new Uint8ClampedArray(256 * 3);
	for (let i = 0; i < 256; i++) {
		const l = clamp((i / 255 - 0.5) * (1 + contrast) + 0.5 + brightness);
		let c: Rgb;
		if (f.tones) {
			const [shadow, middle, high] = f.tones.map(rgb);
			c = l < pivot ? mix(shadow, middle, l / pivot) : mix(middle, high, smooth(pivot, 1, l));
		} else if (f.light) c = mix(rgb(f.accent), rgb(f.paper), l);
		else c = mix([0, 0, 0], rgb(f.accent), l);
		lut.set(c.map(Math.round), i * 3);
	}
	return lut;
}

/** The lightness of a pixel, 0 to 255 (Rec. 709, as the shaders weigh it). */
export function lightness(r: number, g: number, b: number): number {
	return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
}

const graded = new Map<string, Promise<string>>();

/**
 * The address of `src` graded in `f`'s colours: a picture made once in the
 * browser (at most 1920 wide) and kept for the visit; `src` itself when the
 * flavour doesn't grade, or the picture can't be read.
 */
export function gradeStill(src: string, f: FlavourData): Promise<string> {
	const lut = toneOf(f);
	if (!lut || !src || typeof document === 'undefined') return Promise.resolve(src);
	const key = `${f.key}|${src}`;
	let done = graded.get(key);
	if (!done) {
		done = draw(src, lut).catch(() => src);
		graded.set(key, done);
	}
	return done;
}

async function draw(src: string, lut: Uint8ClampedArray): Promise<string> {
	const img = new Image();
	img.decoding = 'async';
	img.src = src;
	await img.decode();
	const scale = Math.min(1, 1920 / img.naturalWidth);
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(img.naturalWidth * scale);
	canvas.height = Math.round(img.naturalHeight * scale);
	const g = canvas.getContext('2d', { willReadFrequently: true });
	if (!g) return src;
	g.drawImage(img, 0, 0, canvas.width, canvas.height);
	const pixels = g.getImageData(0, 0, canvas.width, canvas.height);
	const d = pixels.data;
	for (let i = 0; i < d.length; i += 4) {
		const l = lightness(d[i], d[i + 1], d[i + 2]) * 3;
		d[i] = lut[l];
		d[i + 1] = lut[l + 1];
		d[i + 2] = lut[l + 2];
	}
	g.putImageData(pixels, 0, 0);
	const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.9));
	return blob ? URL.createObjectURL(blob) : src;
}
