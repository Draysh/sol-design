import luna from './assets/disc-luna.webp';
import mercury from './assets/disc-mercury.webp';
import neptune from './assets/disc-neptune.webp';
import sun from './assets/disc-sun.webp';
import terra from './assets/disc-terra.webp';
import titan from './assets/disc-titan.webp';
import triton from './assets/disc-triton.webp';
import saturn from './assets/saturn.webp';

/**
 * Where a body sits on a sheet. Landscape positions are in a 1600 × 900
 * frame, portrait ones in a 390-wide frame; both scale with the sheet's width.
 */
export interface Placement {
	cx: number;
	cy: number;
	r: number;
	/** Where the light comes from, in degrees clockwise from the top. */
	light: number;
	/** How much of the disc is lit: 0 is new, 1 is full. */
	phase: number;
}

export interface Companion extends Placement {
	world: string;
}

export interface World {
	id: string;
	name: string;
	/** One line about what the app is for. */
	tagline: string;
	kind: 'star' | 'planet' | 'moon';
	/** The planet a moon orbits; moons open from their planet's screens. */
	parent?: string;
	/** Glow and icon colour, sampled from the photograph. */
	color: string;
	/** Real axial tilt in degrees; the reticle's axis leans by it. */
	tilt: number;
	/** A tightly cropped square photo of the disc (or Saturn's full frame). */
	image: string;
	render: 'star' | 'disc' | 'photo';
	/** Effects particular to one world. */
	effect?: 'haze' | 'split-rim';
	hero: Placement;
	portrait: Placement;
	/** Where the callout's text block starts, in the landscape frame. */
	callout: { x: number; y: number; flip?: boolean };
	companions?: Companion[];
}

/** Rising from the bottom of a phone screen, lit from above. */
/**
 * Triton's light, wherever it is drawn. Its photo is the Voyager mosaic:
 * Voyager saw only the southern half, so the bottom of the picture is black.
 * Lit from just left of the top and a little less than half lit, that part
 * falls in the shadow and only photographed ground shows.
 */
const TRITON = { light: 345, phase: 0.45 };

const rising: Placement = { cx: 195, cy: 600, r: 470, light: 0, phase: 0.08 };

export const worlds: Record<string, World> = {
	sol: {
		id: 'sol',
		name: 'Sol',
		tagline: 'The hub: sign-in, worlds and events',
		kind: 'star',
		color: '#ff7a2e',
		tilt: 7.25,
		image: sun,
		render: 'star',
		hero: { cx: 1400, cy: 450, r: 540, light: 90, phase: 0.5 },
		portrait: { cx: 195, cy: 720, r: 520, light: 0, phase: 1 },
		callout: { x: 380, y: 250 }
	},
	terra: {
		id: 'terra',
		name: 'Terra',
		tagline: 'Habits, diary and wellbeing',
		kind: 'planet',
		color: '#8ec5ff',
		tilt: 23.44,
		image: terra,
		render: 'disc',
		hero: { cx: 1080, cy: 420, r: 300, light: 90, phase: 0.55 },
		portrait: rising,
		callout: { x: 620, y: 250, flip: true },
		companions: [{ world: 'luna', cx: 360, cy: 170, r: 40, light: 90, phase: 0.5 }]
	},
	luna: {
		id: 'luna',
		name: 'Luna',
		tagline: 'Terra’s quieter twin',
		kind: 'moon',
		parent: 'terra',
		color: '#ffffff',
		tilt: 6.68,
		image: luna,
		render: 'disc',
		hero: { cx: 560, cy: 450, r: 320, light: 270, phase: 0.28 },
		portrait: rising,
		callout: { x: 1040, y: 290 }
	},
	saturn: {
		id: 'saturn',
		name: 'Saturn',
		tagline: 'Movies, series and anime',
		kind: 'planet',
		color: '#e6cf9e',
		tilt: 26.73,
		image: saturn,
		render: 'photo',
		hero: { cx: 800, cy: 450, r: 760, light: 90, phase: 1 },
		portrait: { cx: 195, cy: 560, r: 300, light: 0, phase: 1 },
		callout: { x: 1180, y: 150 }
	},
	titan: {
		id: 'titan',
		name: 'Titan',
		tagline: 'What to watch next, chosen at home',
		kind: 'moon',
		parent: 'saturn',
		color: '#ffb06a',
		tilt: 0.3,
		image: titan,
		render: 'disc',
		effect: 'haze',
		hero: { cx: 560, cy: 450, r: 280, light: 45, phase: 0.42 },
		portrait: rising,
		callout: { x: 1000, y: 290 }
	},
	mercury: {
		id: 'mercury',
		name: 'Mercury',
		tagline: 'Japanese, every day',
		kind: 'planet',
		color: '#f2f2f2',
		tilt: 0.03,
		image: mercury,
		render: 'disc',
		effect: 'split-rim',
		hero: { cx: 820, cy: 860, r: 640, light: 0, phase: 0.22 },
		portrait: rising,
		callout: { x: 1100, y: 110 }
	},
	neptune: {
		id: 'neptune',
		name: 'Neptune',
		tagline: 'Your music, through Navidrome',
		kind: 'planet',
		color: '#6f9bff',
		tilt: 28.32,
		image: neptune,
		render: 'disc',
		hero: { cx: 520, cy: 1010, r: 790, light: 315, phase: 0.15 },
		portrait: rising,
		callout: { x: 1000, y: 236 },
		companions: [{ world: 'triton', cx: 1080, cy: 610, r: 86, light: TRITON.light, phase: TRITON.phase }]
	},
	triton: {
		id: 'triton',
		name: 'Triton',
		tagline: 'Radio and discovery',
		kind: 'moon',
		parent: 'neptune',
		color: '#cfe8ff',
		tilt: 157,
		image: triton,
		render: 'disc',
		hero: { cx: 1080, cy: 560, r: 300, ...TRITON },
		portrait: rising,
		callout: { x: 640, y: 230, flip: true }
	}
};

/** A world that isn't in the list yet still gets a sensible look. */
export function world(id: string): World {
	return (
		worlds[id] ?? {
			id,
			name: id.charAt(0).toUpperCase() + id.slice(1),
			tagline: '',
			kind: 'planet',
			color: '#f2f2f2',
			tilt: 0,
			image: '',
			render: 'disc',
			hero: { cx: 1100, cy: 560, r: 320, light: 315, phase: 0.4 },
			portrait: rising,
			callout: { x: 620, y: 240, flip: true }
		}
	);
}

/** The moons that open from a world's screens. */
export function moonsOf(id: string): World[] {
	return Object.values(worlds).filter((w) => w.parent === id);
}
