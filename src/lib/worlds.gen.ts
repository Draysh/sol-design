// Written by scripts/worlds-from-qml.mjs from sol-quick's qml/Worlds.qml; don't edit by hand.
// Photographs are by name (`image`): worlds.ts gives each its picture.
import type { WorldData, Placement, Light } from './worlds.js';

export const rising: Placement = {"cx":195,"cy":930,"r":520,"light":0,"phase":0.1};

export const lit: Light = {"light":300,"phase":0.72};

export const table: Record<string, WorldData> = {
	"sol": {
		"id": "sol",
		"live": "corona",
		"name": "Sol",
		"role": "Hub",
		"tagline": "The hub: sign-in, worlds and events",
		"kind": "star",
		"color": "#ff7a2e",
		"tilt": 7.25,
		"image": "disc-sun",
		"render": "star",
		"hero": {
			"cx": 1400,
			"cy": 450,
			"r": 540,
			"light": 90,
			"phase": 0.5
		},
		"portrait": {
			"cx": 195,
			"cy": 720,
			"r": 520,
			"light": 0,
			"phase": 1
		},
		"icon": {
			"light": 90,
			"phase": 1
		},
		"callout": {
			"x": 380,
			"y": 250
		}
	},
	"terra": {
		"id": "terra",
		"live": "clouds",
		"name": "Terra",
		"role": "Habits and diary",
		"tagline": "Habits, diary and wellbeing",
		"kind": "planet",
		"color": "#8ec5ff",
		"tilt": 23.44,
		"image": "disc-terra",
		"render": "disc",
		"air": 0.5,
		"fit": {
			"x": 0.5,
			"y": 0.506,
			"r": 0.466
		},
		"hero": {
			"cx": 1130,
			"cy": 450,
			"r": 170,
			"light": 90,
			"phase": 0.55
		},
		"portrait": {
			"cx": 195,
			"cy": 930,
			"r": 520,
			"light": 0,
			"phase": 0.1
		},
		"icon": {
			"light": 300,
			"phase": 0.72
		},
		"callout": {
			"x": 620,
			"y": 320,
			"flip": true
		},
		"companions": [
			{
				"world": "luna",
				"cx": 1395,
				"cy": 300,
				"r": 30,
				"light": 90,
				"phase": 0.5
			}
		]
	},
	"luna": {
		"id": "luna",
		"name": "Luna",
		"role": "Sleep and evenings",
		"tagline": "Terra’s quieter twin",
		"kind": "moon",
		"parent": "terra",
		"color": "#ffffff",
		"tilt": 6.68,
		"image": "disc-luna",
		"render": "disc",
		"fit": {
			"x": 0.493,
			"y": 0.506,
			"r": 0.494
		},
		"hero": {
			"cx": 480,
			"cy": 450,
			"r": 175,
			"light": 270,
			"phase": 0.28
		},
		"portrait": {
			"cx": 195,
			"cy": 930,
			"r": 520,
			"light": 0,
			"phase": 0.1
		},
		"icon": {
			"light": 300,
			"phase": 0.72
		},
		"callout": {
			"x": 1060,
			"y": 320
		}
	},
	"saturn": {
		"id": "saturn",
		"name": "Saturn",
		"role": "Films, series, anime",
		"tagline": "Movies, series and anime",
		"kind": "planet",
		"color": "#e6cf9e",
		"tilt": 26.73,
		"image": "saturn",
		"render": "photo",
		"fit": {
			"x": 0.498,
			"y": 0.517,
			"r": 0.43
		},
		"hero": {
			"cx": 1250,
			"cy": 450,
			"r": 320,
			"light": 90,
			"phase": 1
		},
		"portrait": {
			"cx": 300,
			"cy": 175,
			"r": 82,
			"light": 0,
			"phase": 1
		},
		"icon": {
			"light": 90,
			"phase": 1
		},
		"callout": {
			"x": 620,
			"y": 320,
			"flip": true
		}
	},
	"titan": {
		"id": "titan",
		"live": "clouds",
		"name": "Titan",
		"role": "What to watch",
		"tagline": "What to watch next, chosen at home",
		"kind": "moon",
		"parent": "saturn",
		"color": "#ffb06a",
		"tilt": 0.3,
		"image": "disc-titan",
		"render": "disc",
		"effect": "haze",
		"air": 1,
		"fit": {
			"x": 0.503,
			"y": 0.507,
			"r": 0.445
		},
		"hero": {
			"cx": 340,
			"cy": 450,
			"r": 165,
			"light": 60,
			"phase": 0.38
		},
		"portrait": {
			"cx": 195,
			"cy": 930,
			"r": 520,
			"light": 0,
			"phase": 0.1
		},
		"icon": {
			"light": 300,
			"phase": 0.72
		},
		"callout": {
			"x": 1060,
			"y": 320
		}
	},
	"mercury": {
		"id": "mercury",
		"name": "Mercury",
		"role": "Japanese",
		"tagline": "Japanese, every day",
		"kind": "planet",
		"color": "#f2f2f2",
		"tilt": 0.03,
		"image": "disc-mercury",
		"render": "disc",
		"fit": {
			"x": 0.4985,
			"y": 0.4994,
			"r": 0.497,
			"lit": 90
		},
		"hero": {
			"cx": 820,
			"cy": 1010,
			"r": 700,
			"light": 20,
			"phase": 0.12
		},
		"portrait": {
			"cx": 195,
			"cy": 930,
			"r": 520,
			"light": 0,
			"phase": 0.1
		},
		"icon": {
			"light": 300,
			"phase": 0.72
		},
		"callout": {
			"x": 1220,
			"y": 280
		}
	},
	"neptune": {
		"id": "neptune",
		"live": "clouds",
		"name": "Neptune",
		"role": "Music",
		"tagline": "Your music, through Navidrome",
		"kind": "planet",
		"color": "#6f9bff",
		"tilt": 28.32,
		"image": "disc-neptune",
		"render": "disc",
		"air": 0.6,
		"fit": {
			"x": 0.494,
			"y": 0.494,
			"r": 0.485
		},
		"hero": {
			"cx": 560,
			"cy": 1240,
			"r": 880,
			"light": 330,
			"phase": 0.14
		},
		"portrait": {
			"cx": 195,
			"cy": 930,
			"r": 520,
			"light": 0,
			"phase": 0.1
		},
		"icon": {
			"light": 300,
			"phase": 0.72
		},
		"callout": {
			"x": 560,
			"y": 240,
			"flip": true
		},
		"companions": [
			{
				"world": "triton",
				"cx": 1250,
				"cy": 380,
				"r": 50,
				"light": 300,
				"phase": 0.45
			}
		]
	},
	"triton": {
		"id": "triton",
		"name": "Triton",
		"role": "Radio",
		"tagline": "Radio and discovery",
		"kind": "moon",
		"parent": "neptune",
		"color": "#e4d1dd",
		"tilt": 157,
		"image": "disc-triton",
		"render": "disc",
		"air": 0.12,
		"fit": {
			"x": 0.53,
			"y": 0.49,
			"r": 0.455
		},
		"hero": {
			"cx": 1130,
			"cy": 450,
			"r": 170,
			"light": 300,
			"phase": 0.62
		},
		"portrait": {
			"cx": 195,
			"cy": 930,
			"r": 520,
			"light": 0,
			"phase": 0.1
		},
		"icon": {
			"light": 300,
			"phase": 0.72
		},
		"callout": {
			"x": 620,
			"y": 320,
			"flip": true
		}
	}
};
