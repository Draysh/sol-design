/**
 * The lighting behind `Body`: sol-quick's `shaders/body.frag` in WebGL. One
 * hidden WebGL canvas draws every body on the page in turn and each Body
 * copies its picture onto a 2D canvas of its own, so a page with many
 * bodies holds one GPU context, not one each. Bodies that move (clouds, a
 * corona) are drawn again on one shared frame loop, while they are on
 * screen, big enough to see it, and the page is visible.
 */

// A world, lit from one side. The canvas is a square 3.4 radii wide: the disc
// has radius 1 in its middle and the glow reaches out to 1.7. `mode` 0 is a
// disc (a planet or a moon), 1 a star (Sol), 2 a photograph used whole
// (Saturn). `away` points from the light to the shadow; `phase` 0 is new, 1
// full. `fit` is where the disc is in the photograph (centre and radius in
// its coordinates) and how far to turn the photograph (radians, clockwise).
// `air` is how much atmosphere there is (0 none, 1 Titan's); `effect` 1 makes
// it a haze that rings even the night side. `live` 1 drifts clouds over the
// disc, 2 makes a star's corona flicker; `time` is seconds. `px` is a pixel
// in the disc's units, `small` 1 where the body is tiny on screen.
const fragment = `
precision highp float;
varying vec2 uv0;
uniform vec2 away;
uniform float phase;
uniform vec3 world;
uniform float mode;
uniform float effect;
uniform float aspect;
uniform float time;
uniform float live;
uniform float day;
uniform vec4 fit;
uniform float air;
uniform float px;
uniform float small;
uniform sampler2D source;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float clouds(vec2 p, float t) {
	float n = noise(p * 3.0 + vec2(t * 0.05, 0.0)) * 0.5;
	n += noise(p * 7.0 + vec2(t * 0.09, t * 0.02)) * 0.3;
	n += noise(p * 15.0 - vec2(t * 0.13, 0.0)) * 0.2;
	return n;
}

void main() {
	vec2 p = (uv0 - 0.5) * 3.4;
	float d = length(p);
	vec4 o = vec4(0.0);

	if (mode > 1.5) {
		// The photograph fitted into the disc's box, whole, laid on as light:
		// what is nearly black becomes see-through. Only the body and its
		// rings, a flat ellipse across the box: stray specks are left out.
		vec2 uv = fit.xy + vec2(p.x, p.y / aspect) * fit.z;
		float band = length(p / vec2(1.0, 0.45));
		if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0 && band < 1.05) {
			vec3 c = texture2D(source, uv).rgb;
			float bright = max(c.r, max(c.g, c.b));
			float a = smoothstep(mix(0.02, 0.04, day), mix(0.14, 0.3, day), bright) * smoothstep(1.05, 0.98, band);
			vec3 lit = max(c - vec3(0.015), vec3(0.0)) / 0.985;
			o = vec4(min(lit, vec3(a * 1.6)), a);
		}
		gl_FragColor = o;
		return;
	}

	float inside = 1.0 - smoothstep(1.0 - px * 1.5, 1.0 + px * 0.5, d);

	if (mode > 0.5) {
		// A star: the corona, the tinted disc, a darker limb, and the night side.
		vec4 photo = texture2D(source, clamp((p + 1.0) * 0.5, 0.0, 1.0));
		float flicker = live > 1.5 ? 0.85 + 0.3 * noise(vec2(atan(p.y, p.x) * 3.0, time * 0.4)) : 1.0;
		float corona = smoothstep(1.7, 0.55, d) * flicker;
		vec3 coronaColor = mix(vec3(0.72, 0.25, 0.10) * 0.16, world * 0.55, smoothstep(0.75, 0.55, d));
		o = vec4(coronaColor, 1.0) * corona * smoothstep(1.7, 1.0, d) * (1.0 - inside);
		vec3 tinted = vec3(
			0.75 * photo.r + 0.45 * photo.g + 0.10 * photo.b + 0.06,
			0.32 * photo.r + 0.32 * photo.g + 0.06 * photo.b + 0.01,
			0.06 * photo.r + 0.06 * photo.g + 0.03 * photo.b);
		if (live > 1.5) {
			tinted *= 0.92 + 0.16 * noise(p * 9.0 + vec2(time * 0.06, -time * 0.04));
		}
		float limb = smoothstep(0.55, 1.0, d);
		tinted = mix(tinted, vec3(0.16, 0.03, 0.0), limb * 0.5);
		tinted *= 1.0 - smoothstep(0.88, 1.0, d) * 0.85;
		if (phase < 1.0) {
			float along = dot(p, normalize(away + vec2(1e-5))) * 0.5 + 0.5;
			tinted *= 1.0 - mix(0.92, 0.0, smoothstep(0.0, 1.0, along));
		}
		vec4 disc = vec4(tinted, 1.0) * inside;
		o = o * (1.0 - inside) + disc;
		gl_FragColor = o;
		return;
	}

	// A disc: a sphere lit by a distant sun, the light's direction from the
	// phase and \`away\`: towards the viewer at full, behind the body at new.
	float cosA = clamp(phase, 0.0, 1.0) * 2.0 - 1.0;
	float sinA = sqrt(max(0.0, 1.0 - cosA * cosA));
	vec3 L = vec3(-normalize(away + vec2(1e-5)) * sinA, cosA);
	float dd = min(d, 1.0);
	vec3 n = vec3(p / max(d, 1e-4) * dd, sqrt(max(0.0, 1.0 - dd * dd)));
	float mu0 = dot(n, L);
	float mu = n.z;
	float thick = clamp(air, 0.0, 1.0);

	// The photograph: the disc where it is in the picture, turned so its own
	// light faces this one.
	float ct = cos(fit.w);
	float st = sin(fit.w);
	vec2 q = p / max(d, 1.0);
	vec2 turned = vec2(ct * q.x + st * q.y, -st * q.x + ct * q.y);
	vec4 photo = texture2D(source, clamp(fit.xy + turned * fit.z, 0.0, 1.0));
	vec3 base = photo.a > 0.5 ? photo.rgb : vec3(0.10);
	if (live > 0.5) {
		vec2 sphere = vec2(asin(clamp(p.x, -1.0, 1.0)), asin(clamp(p.y, -1.0, 1.0)));
		float c = clouds(sphere, time);
		float cover = smoothstep(0.52, 0.78, c) * 0.5 * (0.4 + 0.6 * mu);
		vec3 cloud = effect > 0.5 ? mix(base, vec3(1.0, 0.86, 0.62), 0.5) : vec3(0.92, 0.94, 0.97);
		base = mix(base, cloud, effect > 0.5 ? cover * 0.6 : cover);
	}

	// The terminator: soft where there is air to bend the light, crisp on rock.
	float w = max(mix(0.035, 0.14, thick), px * 1.5);
	float dayside = smoothstep(-w * 0.6, w, mu0);
	float m0 = max(mu0, 0.0);
	float rock = 2.0 * m0 / (m0 + mu + 0.02);
	float soft = m0 / max(mu, 0.32);
	float shade = min(mix(rock, soft, min(1.0, thick * 2.0)), 1.25);
	shade *= mix(mix(0.8, 1.0, smoothstep(0.0, 0.45, mu)), 1.0, min(1.0, thick * 2.0));
	float veil = thick * pow(1.0 - mu, 2.5) * smoothstep(-0.1, 0.5, mu0);
	vec3 ground = mix(base * shade, world * (0.35 + 0.65 * smoothstep(0.0, 0.6, mu0)), min(0.6, veil * 0.8));
	float ambient = mix(0.025 + 0.09 * pow(1.0 - clamp(phase, 0.0, 1.0), 2.0), 0.16, small) * (1.0 - day * 0.75);
	vec3 body = mix(base * ambient, ground, dayside);
	float glowing = smoothstep(0.0, 0.3, dot(body, vec3(0.3, 0.5, 0.2)));
	float alpha = mix(1.0, max(0.08, glowing), day);
	vec4 disc = vec4(body, alpha) * inside;

	// The atmosphere seen edge-on: a thin rim beyond the limb, brightest under
	// the sun; backlit, it rings the whole body. A haze rings the night side too.
	vec4 halo = vec4(0.0);
	if (thick > 0.0) {
		vec2 dir = p / max(d, 1e-4);
		float depth = max(0.012 + 0.055 * thick, px * 1.2);
		float above = max(d - 1.0, 0.0);
		float fall = exp(-above / depth) * smoothstep(1.0 - px * 1.5, 1.0 + px * 0.5, d);
		float under = dot(dir, L.xy) + 0.4 * L.z;
		float litRim = smoothstep(-0.35, 0.55, under) + smoothstep(0.4, 1.0, -L.z) * 0.6;
		if (effect > 0.5) litRim = mix(0.3, 1.0, clamp(litRim, 0.0, 1.0));
		float breath = live > 0.5 ? 1.0 + 0.05 * sin(time * 0.5) : 1.0;
		float strength = (0.25 + 0.65 * thick) * mix(1.0, 0.6, day);
		float glow = fall * clamp(litRim, 0.0, 1.0) * strength * breath;
		vec3 glowColor = effect > 0.5 ? mix(world, vec3(0.95, 0.62, 0.30), 0.35) : world;
		halo = vec4(glowColor * glow, glow * 0.35);
	}
	gl_FragColor = disc + halo * (1.0 - inside);
}
`;

const vertex = `
attribute vec2 at;
varying vec2 uv0;
void main() {
	uv0 = vec2((at.x + 1.0) * 0.5, (1.0 - at.y) * 0.5);
	gl_Position = vec4(at, 0.0, 1.0);
}
`;

/** What one body asks to be drawn as. */
export interface BodyLook {
	image: string;
	/** 0 disc, 1 star, 2 photograph used whole. */
	mode: number;
	effect: number;
	live: number;
	color: string;
	/** Degrees clockwise from the top. */
	light: number;
	phase: number;
	fit: { x: number; y: number; r: number; turn: number };
	air: number;
	/** The photograph's height over its width (mode 2). */
	aspect: number;
	day: boolean;
	/** The disc's diameter on screen, in CSS pixels. */
	disc: number;
}

/** The largest picture drawn, in device pixels a side. */
const MOST = 2048;

type Gl = WebGLRenderingContext;

class Renderer {
	readonly canvas: HTMLCanvasElement;
	readonly gl: Gl;
	readonly program: WebGLProgram;
	readonly at: Record<string, WebGLUniformLocation | null> = {};
	readonly textures = new Map<string, WebGLTexture | 'loading'>();
	readonly waiting = new Map<string, Set<() => void>>();

	constructor(canvas: HTMLCanvasElement, gl: Gl) {
		this.canvas = canvas;
		this.gl = gl;
		const program = gl.createProgram()!;
		for (const [kind, text] of [
			[gl.VERTEX_SHADER, vertex],
			[gl.FRAGMENT_SHADER, fragment]
		] as const) {
			const shader = gl.createShader(kind)!;
			gl.shaderSource(shader, text);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader');
			gl.attachShader(program, shader);
		}
		gl.bindAttribLocation(program, 0, 'at');
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'program');
		this.program = program;
		gl.useProgram(program);
		for (const name of ['away', 'phase', 'world', 'mode', 'effect', 'aspect', 'time', 'live', 'day', 'fit', 'air', 'px', 'small', 'source']) {
			this.at[name] = gl.getUniformLocation(program, name);
		}
		const quad = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, quad);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.uniform1i(this.at.source, 0);
	}

	/** The photograph as a texture, or null while it loads (`ready` is called once it has). */
	texture(url: string, ready: () => void): WebGLTexture | null {
		const known = this.textures.get(url);
		if (known && known !== 'loading') return known;
		let calls = this.waiting.get(url);
		if (!calls) this.waiting.set(url, (calls = new Set()));
		calls.add(ready);
		if (known === 'loading') return null;
		this.textures.set(url, 'loading');
		const img = new Image();
		img.decoding = 'async';
		img.onload = () => {
			// Scaled to a power of two, so it can have mipmaps in WebGL 1 and
			// stays clean at the sidebar's 22 px.
			const side = (n: number) => Math.min(2048, 2 ** Math.round(Math.log2(Math.max(1, n))));
			const fit = document.createElement('canvas');
			fit.width = side(img.naturalWidth);
			fit.height = side(img.naturalHeight);
			fit.getContext('2d')!.drawImage(img, 0, 0, fit.width, fit.height);
			const gl = this.gl;
			const tex = gl.createTexture()!;
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fit);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			this.textures.set(url, tex);
			for (const call of this.waiting.get(url) ?? []) call();
			this.waiting.delete(url);
		};
		img.onerror = () => this.waiting.delete(url);
		img.src = url;
		return null;
	}

	/** Draws `look` at `time` onto `target` (sized already); false while its photograph loads. */
	draw(target: HTMLCanvasElement, look: BodyLook, time: number, ready: () => void): boolean {
		const tex = this.texture(look.image, ready);
		if (!tex) return false;
		const gl = this.gl;
		const w = target.width;
		const h = target.height;
		if (this.canvas.width < w || this.canvas.height < h) {
			this.canvas.width = Math.max(this.canvas.width, w);
			this.canvas.height = Math.max(this.canvas.height, h);
		}
		gl.viewport(0, 0, w, h);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.bindTexture(gl.TEXTURE_2D, tex);
		const a = (look.light * Math.PI) / 180;
		const color = rgb(look.color);
		const at = this.at;
		gl.uniform2f(at.away, -Math.sin(a), Math.cos(a));
		gl.uniform1f(at.phase, look.phase);
		gl.uniform3f(at.world, color[0], color[1], color[2]);
		gl.uniform1f(at.mode, look.mode);
		gl.uniform1f(at.effect, look.effect);
		gl.uniform1f(at.aspect, look.aspect);
		gl.uniform1f(at.time, time);
		gl.uniform1f(at.live, look.live);
		gl.uniform1f(at.day, look.day ? 1 : 0);
		gl.uniform4f(at.fit, look.fit.x, look.fit.y, look.fit.r, look.fit.turn);
		gl.uniform1f(at.air, look.air);
		gl.uniform1f(at.px, 3.4 / w);
		const t = Math.min(1, Math.max(0, (look.disc - 28) / (96 - 28)));
		gl.uniform1f(at.small, 1 - t * t * (3 - 2 * t));
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		const ctx = target.getContext('2d');
		if (!ctx) return false;
		ctx.clearRect(0, 0, w, h);
		// WebGL's rows run from the bottom: the picture is the canvas's bottom-left corner.
		ctx.drawImage(this.canvas, 0, this.canvas.height - h, w, h, 0, 0, w, h);
		return true;
	}
}

function rgb(hex: string): [number, number, number] {
	const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
	const n = m ? parseInt(m[1], 16) : 0xf2f2f2;
	return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

let shared: Renderer | null | undefined;

/** The page's one renderer, or null where there is no WebGL. */
export function renderer(): Renderer | null {
	if (shared !== undefined) return shared;
	try {
		const canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 256;
		const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: true });
		shared = gl ? new Renderer(canvas, gl) : null;
	} catch {
		shared = null;
	}
	return shared;
}

/** The size a body's canvas is drawn at, in device pixels a side. */
export function sideFor(cssSide: number): number {
	const ratio = typeof devicePixelRatio === 'number' ? devicePixelRatio : 1;
	return Math.max(8, Math.min(MOST, Math.round(cssSide * ratio)));
}

// ---- The frame loop for bodies that move --------------------------------

const moving = new Set<(time: number) => void>();
let frame = 0;
let last = 0;
let clock = 0;

/** Time in seconds that only runs while something moves; it picks up where it stopped. */
function tick(now: number) {
	frame = 0;
	if (!moving.size) return;
	const step = last ? Math.min(0.1, (now - last) / 1000) : 0;
	// Thirty frames a second: clouds drift slowly, and the pane keeps its frames.
	if (step < 1 / 32 && last) {
		frame = requestAnimationFrame(tick);
		return;
	}
	last = now;
	if (!document.hidden) {
		clock = (clock + step) % 3600;
		for (const draw of moving) draw(clock);
	}
	frame = requestAnimationFrame(tick);
}

/** Draws `draw` every frame until the returned function is called. */
export function animate(draw: (time: number) => void): () => void {
	moving.add(draw);
	if (!frame) {
		last = 0;
		frame = requestAnimationFrame(tick);
	}
	return () => {
		moving.delete(draw);
		if (!moving.size && frame) {
			cancelAnimationFrame(frame);
			frame = 0;
		}
	};
}

/** The time the moving bodies are at, for drawing a still one to match. */
export function now(): number {
	return clock;
}
