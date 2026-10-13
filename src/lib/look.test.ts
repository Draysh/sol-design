import { describe, expect, it } from 'vitest';
import { capsFor, flavourOf, hasJp, jpOf, planetOf, stillFor } from './look.js';

describe('flavourOf', () => {
	it('gives a planet its own, a moon its own or its planet’s, and Sol Saturn’s', () => {
		expect(flavourOf('mercury').id).toBe('mercury');
		expect(flavourOf('luna').id).toBe('luna');
		expect(flavourOf('titan').id).toBe('saturn');
		expect(flavourOf('triton').id).toBe('neptune');
		expect(flavourOf('sol').id).toBe('saturn');
		expect(flavourOf('somewhere-new').id).toBe('saturn');
	});

	it('knows Terra’s noon is the light one', () => {
		expect(flavourOf('terra').light).toBe(true);
		expect(flavourOf('saturn').light).toBe(false);
	});
});

describe('names', () => {
	it('writes every world in Japanese', () => {
		expect(jpOf('sol')).toBe('太陽');
		expect(jpOf('titan')).toBe('タイタン');
		expect(planetOf('titan')).toBe('saturn');
		expect(planetOf('saturn')).toBe('saturn');
	});
});

describe('capsFor', () => {
	it('sets one to three words in capitals, never Japanese or a sentence', () => {
		expect(capsFor('In orbit')).toBe(true);
		expect(capsFor('Add a world')).toBe(true);
		expect(capsFor('Add a world from GitHub')).toBe(false);
		expect(capsFor('7 due · 0 new · 12 cards')).toBe(true);
		expect(capsFor('設定')).toBe(false);
		expect(hasJp('Sol 太陽')).toBe(true);
	});
});

describe('stillFor', () => {
	const stills = ['/look/saturn-ground-1.jpg', '/look/saturn-ground-2.jpg', '/look/saturn-ground-10.jpg', '/look/luna-ground-1.jpg', '/look/terra-ground-1.jpg'];

	it('takes a world’s stills in turn by section, ten after two', () => {
		expect(stillFor('saturn', stills, 0)).toBe('/look/saturn-ground-1.jpg');
		expect(stillFor('saturn', stills, 1)).toBe('/look/saturn-ground-2.jpg');
		expect(stillFor('saturn', stills, 2)).toBe('/look/saturn-ground-10.jpg');
		expect(stillFor('saturn', stills, 3)).toBe('/look/saturn-ground-1.jpg');
	});

	it('stands a moon on its own stills, or else its planet’s', () => {
		expect(stillFor('luna', stills)).toBe('/look/luna-ground-1.jpg');
		expect(stillFor('titan', stills)).toBe('/look/saturn-ground-1.jpg');
		expect(stillFor('sol', stills, 1)).toBe('/look/saturn-ground-2.jpg');
	});

	it('is the drawn sky without one', () => {
		expect(stillFor('neptune', stills)).toBe('');
		expect(stillFor('saturn', [])).toBe('');
	});
});
