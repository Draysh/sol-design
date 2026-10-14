// Written by scripts/look-from-qml.mjs from sol-quick's qml/Theme.qml; don't edit by hand.
// The colours are in tokens.css; this is what a script needs of each flavour.

/** A flavour, as `Theme.yozoraLooks` has it. */
export interface FlavourData {
	id: string;
	/** Its name in Japanese, and the one kanji the rail's diamond shows. */
	jp: string;
	glyph: string;
	/** The character who says a page's line in the apps. */
	navigator: string;
	/** What its panels carry: "dusk", "shrine", "neon" or "summer". */
	motif: string;
	/** Whose stills it stands on. */
	film: string;
	/** Frosted glass with dark words (Terra's noon). */
	light: boolean;
	/** Stars on its drawn sky. */
	stars: boolean;
	/** Rain over its ground, 0 to 1. */
	rain: number;
	/** The drawn sky without a still, top to bottom. */
	sky: string[];
	/** How its stills are framed, `[zoom, across]`, or whole and centred. */
	frame: [number, number] | null;
	/** Which way its pages turn: "slice" (a glitch), "cut" (a film's), "ink", "sweep" (sunlight), or "curtain", a flat curtain of its light. */
	turn: 'slice' | 'cut' | 'ink' | 'sweep' | 'curtain';
	/** Its key among the flavours, which `data-flavour` names (Titan's own, though its `id` is Saturn's). */
	key: string;
	/** A curtain's one torn frame: "" (a glitch), "bars", "brush", "flare" or "moon". */
	tear: string;
	/** Its stills graded as one colour: black into its light, or (light) its light into paper, or through its `tones`. */
	duotone: boolean;
	/** Near-opaque panels with a hairline in its light instead of glass. */
	panels: boolean;
	/** Big English titles in outline capitals. */
	outline: boolean;
	/** HUD lines written as lowercase captions: "neptune_music / albums". */
	captions: boolean;
	/** Its emblem huge and cropped behind the pages. */
	scaffold: boolean;
	/** The content's columns as hairlines in its light. */
	grid: boolean;
	/** The world's word at the head of a caption when its role is too long ("terra_days"), else "". */
	tag: string;
	/** Its light, and the paper a light flavour stands on (white otherwise), for grading a still. */
	accent: string;
	paper: string;
	/** Shadow, middle and highlight, when its stills are graded through three colours (Luna's). */
	tones: string[] | null;
}

export const flavours: Record<string, FlavourData> = {
	"saturn": {
		"id": "saturn",
		"jp": "土星",
		"glyph": "土",
		"navigator": "Yoko",
		"motif": "dusk",
		"film": "Suzume",
		"light": false,
		"stars": false,
		"rain": 0,
		"sky": [
			"#070605",
			"#0c0a08",
			"#16130b",
			"#2c2307",
			"#5c4609"
		],
		"frame": [
			1.22,
			0
		],
		"turn": "curtain",
		"key": "saturn",
		"tear": "bars",
		"duotone": true,
		"panels": true,
		"outline": true,
		"captions": true,
		"scaffold": true,
		"grid": true,
		"tag": "",
		"accent": "#ffc93c",
		"paper": "#ffffff",
		"tones": null
	},
	"titan": {
		"id": "saturn",
		"jp": "タイタン",
		"glyph": "土",
		"navigator": "Yoko",
		"motif": "dusk",
		"film": "Suzume",
		"light": false,
		"stars": false,
		"rain": 0,
		"sky": [
			"#070605",
			"#0c0a08",
			"#16110b",
			"#2c1a07",
			"#5c3409"
		],
		"frame": [
			1.22,
			0
		],
		"turn": "curtain",
		"key": "titan",
		"tear": "bars",
		"duotone": true,
		"panels": true,
		"outline": true,
		"captions": true,
		"scaffold": true,
		"grid": true,
		"tag": "",
		"accent": "#ff9a1f",
		"paper": "#ffffff",
		"tones": null
	},
	"mercury": {
		"id": "mercury",
		"jp": "水星",
		"glyph": "水",
		"navigator": "Ryuko",
		"motif": "shrine",
		"film": "Your Name",
		"light": false,
		"stars": false,
		"rain": 0,
		"sky": [
			"#070505",
			"#0c0807",
			"#170a0c",
			"#2e0810",
			"#5e0b1a"
		],
		"frame": null,
		"turn": "curtain",
		"key": "mercury",
		"tear": "brush",
		"duotone": true,
		"panels": true,
		"outline": true,
		"captions": true,
		"scaffold": true,
		"grid": true,
		"tag": "",
		"accent": "#e8102f",
		"paper": "#ffffff",
		"tones": null
	},
	"neptune": {
		"id": "neptune",
		"jp": "海王星",
		"glyph": "海",
		"navigator": "Rebecca",
		"motif": "neon",
		"film": "Weathering With You",
		"light": false,
		"stars": false,
		"rain": 1,
		"sky": [
			"#050507",
			"#0b0b0f",
			"#121618",
			"#0a2a24",
			"#0f5a4a"
		],
		"frame": null,
		"turn": "curtain",
		"key": "neptune",
		"tear": "",
		"duotone": true,
		"panels": true,
		"outline": true,
		"captions": true,
		"scaffold": true,
		"grid": true,
		"tag": "",
		"accent": "#3dffd0",
		"paper": "#ffffff",
		"tones": null
	},
	"terra": {
		"id": "terra",
		"jp": "地球",
		"glyph": "地",
		"navigator": "Lucy",
		"motif": "summer",
		"film": "Weathering With You and 5 Centimeters per Second",
		"light": true,
		"stars": false,
		"rain": 0,
		"sky": [
			"#c9dcf5",
			"#dce8f8",
			"#e9f0fa",
			"#f2f6fb",
			"#f6f8fb"
		],
		"frame": null,
		"turn": "curtain",
		"key": "terra",
		"tear": "flare",
		"duotone": true,
		"panels": true,
		"outline": true,
		"captions": true,
		"scaffold": true,
		"grid": true,
		"tag": "terra_days",
		"accent": "#1468d8",
		"paper": "#f6f8fb",
		"tones": null
	},
	"luna": {
		"id": "luna",
		"jp": "月",
		"glyph": "月",
		"navigator": "Lucy",
		"motif": "summer",
		"film": "5 Centimeters per Second",
		"light": false,
		"stars": false,
		"rain": 0,
		"sky": [
			"#05050e",
			"#09091a",
			"#121226",
			"#2a2614",
			"#5a4c18"
		],
		"frame": null,
		"turn": "curtain",
		"key": "luna",
		"tear": "moon",
		"duotone": true,
		"panels": true,
		"outline": true,
		"captions": true,
		"scaffold": true,
		"grid": true,
		"tag": "luna_nights",
		"accent": "#ffe08a",
		"paper": "#ffffff",
		"tones": [
			"#0a0b2a",
			"#3a3d8c",
			"#ffe08a"
		]
	}
};

/** Every world's name in Japanese, a moon's too. */
export const names: Record<string, string> = {
	"sol": "太陽",
	"terra": "地球",
	"luna": "月",
	"saturn": "土星",
	"titan": "タイタン",
	"mercury": "水星",
	"neptune": "海王星",
	"triton": "トリトン"
};
