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
}

export const flavours: Record<string, FlavourData> = {
	"saturn": {
		"id": "saturn",
		"jp": "土星",
		"glyph": "土",
		"navigator": "Suzume",
		"motif": "dusk",
		"film": "Suzume",
		"light": false,
		"stars": true,
		"rain": 0,
		"sky": [
			"#0b0e2a",
			"#2b2468",
			"#8a3c7e",
			"#f07a6a",
			"#ffc07e"
		],
		"frame": [
			1.22,
			0
		]
	},
	"mercury": {
		"id": "mercury",
		"jp": "水星",
		"glyph": "水",
		"navigator": "Mitsuha",
		"motif": "shrine",
		"film": "Your Name",
		"light": false,
		"stars": true,
		"rain": 0,
		"sky": [
			"#05061a",
			"#121848",
			"#2e1e4e",
			"#7a2a3c",
			"#c94a35"
		],
		"frame": null
	},
	"neptune": {
		"id": "neptune",
		"jp": "海王星",
		"glyph": "海",
		"navigator": "Lucy",
		"motif": "neon",
		"film": "Weathering With You",
		"light": false,
		"stars": false,
		"rain": 1,
		"sky": [
			"#040814",
			"#0a1730",
			"#14284f",
			"#3a1c46",
			"#a32a48"
		],
		"frame": null
	},
	"terra": {
		"id": "terra",
		"jp": "地球",
		"glyph": "地",
		"navigator": "Hina",
		"motif": "summer",
		"film": "Weathering With You and 5 Centimeters per Second",
		"light": true,
		"stars": false,
		"rain": 0,
		"sky": [
			"#1f6fd6",
			"#4a90e2",
			"#8fbdf0",
			"#cfe4fa",
			"#eef6ff"
		],
		"frame": null
	},
	"luna": {
		"id": "luna",
		"jp": "月",
		"glyph": "月",
		"navigator": "Hina",
		"motif": "summer",
		"film": "5 Centimeters per Second",
		"light": false,
		"stars": true,
		"rain": 0,
		"sky": [
			"#05061a",
			"#0d1238",
			"#1c2160",
			"#2b2f74",
			"#3d3a86"
		],
		"frame": null
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
