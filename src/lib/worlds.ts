import luna from './assets/disc-luna.webp';
import mercury from './assets/disc-mercury.webp';
import neptune from './assets/disc-neptune.webp';
import sun from './assets/disc-sun.webp';
import terra from './assets/disc-terra.webp';
import titan from './assets/disc-titan.webp';
import triton from './assets/disc-triton.webp';
import saturn from './assets/saturn.webp';
import { lit, rising, table } from './worlds.gen.js';

/*
 * The worlds, as the design knows them. The data comes from sol-quick's
 * `qml/Worlds.qml` (the one source for both kits): `worlds.gen.ts` is
 * written from it by `scripts/worlds-from-qml.mjs`. This file adds the
 * types, this package's pictures and the real sky.
 *
 * A sheet's band shows the middle of its frame: in landscape a 1600 × 900
 * frame (about y 215..685 at any width; the bodies stop growing when the
 * band stops), in portrait a 390-wide frame 580 tall (about y 120..460).
 */

/** Where the light comes from and how much of the disc it lights. */
export interface Light {
	/** Degrees clockwise from the top. */
	light: number;
	/** 0 is new, 1 is full. */
	phase: number;
}

/** Where a body sits on a sheet, in the frame's units, and its light there. */
export interface Placement extends Light {
	cx: number;
	cy: number;
	r: number;
}

export interface Companion extends Placement {
	world: string;
}

/** A world as Worlds.qml has it, with its photograph by name. */
export interface WorldData {
	id: string;
	name: string;
	/** What the app is for in a word or three, shown beside its name. */
	role: string;
	/** One line about what the app is for. */
	tagline: string;
	kind: 'star' | 'planet' | 'moon';
	/** The planet a moon orbits; moons open from their planet's screens. */
	parent?: string;
	/** Glow and icon colour, sampled from the photograph. */
	color: string;
	/** Real axial tilt in degrees; the reticle's axis leans by it. */
	tilt: number;
	image: string;
	/** A disc on a sphere, a star, or a photograph used whole (Saturn). */
	render: 'star' | 'disc' | 'photo';
	/** A haze that rings even the night side (Titan). */
	effect?: 'haze';
	/** What moves on a big body: clouds drifting, a corona flickering. */
	live?: 'clouds' | 'corona';
	/** How much atmosphere: 0 none, 1 Titan's haze. */
	air?: number;
	/**
	 * Where the disc is in the photograph (centre and radius as fractions of
	 * its width) and, for one with a terminator of its own, where its light
	 * comes from (`lit`), so the body turns it to face its light.
	 */
	fit?: { x: number; y: number; r: number; lit?: number };
	hero: Placement;
	portrait: Placement;
	/** The light where the body is small (the sidebar, a list). */
	icon: Light;
	/** Where the callout's text block starts, in the landscape frame. */
	callout: { x: number; y: number; flip?: boolean };
	companions?: Companion[];
}

export interface World extends WorldData {
	/** The photograph's address. */
	image: string;
}

const pictures: Record<string, string> = {
	'disc-luna': luna,
	'disc-mercury': mercury,
	'disc-neptune': neptune,
	'disc-sun': sun,
	'disc-terra': terra,
	'disc-titan': titan,
	'disc-triton': triton,
	saturn
};

export { rising, lit };

export const worlds: Record<string, World> = Object.fromEntries(
	Object.entries(table).map(([id, w]) => [id, { ...w, image: pictures[w.image] ?? '' }])
);

/** A world that isn't in the list yet still gets a sensible look. */
export function world(id: string): World {
	return (
		worlds[id] ?? {
			id,
			name: id.charAt(0).toUpperCase() + id.slice(1),
			role: '',
			tagline: '',
			kind: 'planet',
			color: '#f2f2f2',
			tilt: 0,
			image: '',
			render: 'disc',
			hero: { cx: 1130, cy: 450, r: 170, light: 315, phase: 0.5 },
			portrait: rising,
			icon: lit,
			callout: { x: 620, y: 320, flip: true }
		}
	);
}

/** The moons that open from a world's screens. */
export function moonsOf(id: string): World[] {
	return Object.values(worlds).filter((w) => w.parent === id);
}

/** The worlds this one works with: a moon's planet, a planet's moons. */
export function kin(id: string): World[] {
	const w = world(id);
	return w.kind === 'moon' && w.parent ? [world(w.parent)] : moonsOf(id);
}

/**
 * The moon at `date`: its age in days since new, the lit fraction, whether
 * it is waxing, and its name. From a known new moon and the mean synodic
 * month; within a few hours of the almanac, which a disc can't show.
 */
export function moonAt(date: Date) {
	const synodic = 29.530588853;
	const knownNew = Date.UTC(2000, 0, 6, 18, 14);
	const days = (date.getTime() - knownNew) / 86400000;
	const age = ((days % synodic) + synodic) % synodic;
	const fraction = (1 - Math.cos((2 * Math.PI * age) / synodic)) / 2;
	const names = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
	return { age, fraction, waxing: age < synodic / 2, name: names[Math.floor((age / synodic) * 8 + 0.5) % 8] };
}

/**
 * Where the light falls on a world at `now`, for the ones that follow the
 * real sky; null for the rest. Luna shows tonight's phase, lit on the right
 * while it waxes (as seen from the north). Terra is seen from above where
 * you are: lit from the east in the morning, full at noon, from the west in
 * the evening, a thin crescent at midnight.
 */
export function skyOf(id: string, now = new Date()): Light | null {
	if (id === 'luna') {
		const m = moonAt(now);
		return { phase: Math.max(0.05, m.fraction), light: m.waxing ? 90 : 270 };
	}
	if (id === 'terra') {
		const h = now.getHours() + now.getMinutes() / 60;
		return { phase: Math.max(0.08, (1 - Math.cos((2 * Math.PI * h) / 24)) / 2), light: h < 12 ? 90 : 270 };
	}
	return null;
}
