import { describe, expect, it } from 'vitest';
import { lightness, toneOf } from './grade.js';
import { flavourOf } from './look.js';

const at = (lut: Uint8ClampedArray, i: number) => Array.from(lut.slice(i * 3, i * 3 + 3));

describe('toneOf', () => {
	it('grades a dark flavour’s stills black into its light', () => {
		const lut = toneOf(flavourOf('neptune'))!;
		expect(at(lut, 0)).toEqual([0, 0, 0]);
		// The light lies in the brightest parts, a little held down: mint, #3dffd0.
		at(lut, 255).forEach((v, i) => expect(Math.abs(v - [61, 255, 208][i])).toBeLessThan(16));
		// The middle is darker than half the light (the ramp is lowered a little).
		expect(at(lut, 128)[1]).toBeLessThan(128);
	});

	it('grades a light flavour’s from its light into paper', () => {
		const lut = toneOf(flavourOf('terra'))!;
		expect(at(lut, 0)).toEqual([20, 104, 216]);
		expect(at(lut, 255)).toEqual([246, 248, 251]);
	});

	it('grades Luna’s through its three tones, the yellow only at the top', () => {
		const lut = toneOf(flavourOf('luna'))!;
		expect(at(lut, 0)).toEqual([10, 11, 42]);
		expect(at(lut, 255)).toEqual([255, 224, 138]);
		// Half-way up it is still indigo: blue over red.
		const [r, , b] = at(lut, 128);
		expect(b).toBeGreaterThan(r);
	});

	it('weighs a pixel’s light as the shaders do', () => {
		expect(lightness(255, 255, 255)).toBe(255);
		expect(lightness(0, 255, 0)).toBe(182);
	});
});
