#!/usr/bin/env python3
"""Measures how smoothly a page scrolls in WebKitGTK, the engine every Sol
app's window uses on Linux, the way a person scrolls it: real mouse-wheel
events into a real window. It loads a URL, runs a snippet to get the screen
ready (pair, open a page), then turns the wheel over the pane for a few
seconds and counts the frames the window actually painted (GTK's frame
clock), not the page's animation callbacks: those can tick fast while the
screen is updated far less often. The pointer rests over the pane the whole
time, as a hand on a mouse does, so it also counts what that sets off: how
often something under the pointer was newly hovered, and how many movements
(transitions of transform, translate or scale) started while scrolling.
Things lifting and dropping as they slide under a still pointer are what
reads as the page jumping up and down.

    scripts/scrollbench.py URL [SETUP_JS [SECONDS]]

Prints the screen's refresh rate, the frames painted per second while
scrolling, the median and slow gaps between painted frames, how many gaps
were long enough to see as a stutter, `hovers` and `moves`.

The window is set up the way the apps set up theirs (page updates at the
screen's rate, not near 60), so a change to that is measured here first:

    BENCH_NEAR60=1     keep WebKit's cap of page updates near 60 a second
    BENCH_SMOOTH=0     turn WebKit's smooth wheel scrolling off
    BENCH_FEATURES     WebKit features to set, e.g. MomentumScrollingAnimator=0
    BENCH_W, BENCH_H   the window's size (default 1266 × 840)
    BENCH_LABEL        the window's title, to tell runs apart while watching
    BENCH_WHEEL=8      wheel notches a second (default 8)
    BENCH_GPU=1        print webkit://gpu instead: which vblank monitor WebKit
                       runs on (DRM at the screen's rate, or its 60 Hz timer)
    GDK_BACKEND        wayland (default, as the apps run) or x11
    WEBKIT_FORCE_VBLANK_TIMER=1
                       WebKit's 60 Hz timer, for comparison
    WEBKIT_DISABLE_DMABUF_RENDERER=1
                       software rendering, for comparison; never ship it

Without orbit's `frames` module the window paints 60 frames a second
whatever the page does: GTK 3 spaces its paints by a built-in 60 Hz when
WebKit draws with GL, and where the driver has no drmWaitVBlank (NVIDIA)
WebKit's own clock is 60 Hz too. The apps get past both with `frames`, which
the bench borrows by preloading it (and then calls as the apps do):

    (cd ../kit/orbit && cargo build --release --features app --example frames)
    LD_PRELOAD=../kit/orbit/target/release/examples/libframes.so scripts/scrollbench.py …
"""
import json
import os
import sys

os.environ.setdefault('GDK_BACKEND', 'wayland')
import gi  # noqa: E402

gi.require_version('WebKit2', '4.1')
gi.require_version('Gtk', '3.0')
gi.require_version('Gdk', '3.0')
from gi.repository import Gdk, GLib, Gtk, WebKit2  # noqa: E402

url = 'webkit://gpu' if os.environ.get('BENCH_GPU') == '1' else sys.argv[1]
setup = sys.argv[2] if len(sys.argv) > 2 else ''
seconds = float(sys.argv[3]) if len(sys.argv) > 3 else 4
near60 = os.environ.get('BENCH_NEAR60') == '1'
notches = float(os.environ.get('BENCH_WHEEL', 8))

win = Gtk.Window(title=os.environ.get('BENCH_LABEL', 'scrollbench'))
win.set_default_size(int(os.environ.get('BENCH_W', 1266)), int(os.environ.get('BENCH_H', 840)))
view = WebKit2.WebView()
settings = view.get_settings()
features = WebKit2.Settings.get_all_features()
wanted = {'PreferPageRenderingUpdatesNear60FPS': near60}
for pair in filter(None, os.environ.get('BENCH_FEATURES', '').split(',')):
	name, _, on = pair.partition('=')
	wanted[name] = on not in ('0', 'false', 'off')
for i in range(features.get_length()):
	feature = features.get(i)
	if feature.get_identifier() in wanted:
		settings.set_feature_enabled(feature, wanted[feature.get_identifier()])
if os.environ.get('BENCH_SMOOTH') == '0':
	settings.set_enable_smooth_scrolling(False)
win.add(view)
win.show_all()

# With orbit's `frames` preloaded, do what the apps do once their web view
# exists: page updates and GTK's paints at the screen's rate.
if os.environ.get('BENCH_NEAR60') != '1':
	import ctypes
	try:
		_frames = ctypes.CDLL(None).orbit_frames_full_rate
	except AttributeError:
		_frames = None
	if _frames:
		ctypes.pythonapi.PyCapsule_GetPointer.restype = ctypes.c_void_p
		ctypes.pythonapi.PyCapsule_GetPointer.argtypes = [ctypes.py_object, ctypes.c_char_p]
		_frames.argtypes = [ctypes.c_void_p]
		_frames(ctypes.pythonapi.PyCapsule_GetPointer(view.__gpointer__, None))

painted = []
measuring = False


def after_paint(clock):
	if measuring:
		# When it really painted, not the clock's smoothed frame time.
		painted.append(GLib.get_monotonic_time() / 1000.0)


def pointer():
	"""Puts the pointer over the middle of the pane, where it then stays."""
	event = Gdk.Event.new(Gdk.EventType.MOTION_NOTIFY)
	event.motion.window = view.get_window()
	event.motion.send_event = 1
	event.motion.time = Gtk.get_current_event_time()
	event.motion.x = view.get_allocated_width() * 0.6
	event.motion.y = view.get_allocated_height() * 0.6
	event.set_device(Gdk.Display.get_default().get_default_seat().get_pointer())
	view.event(event)


def wheel():
	"""One notch, over the middle of the pane: down for a while, then up."""
	if not measuring:
		return False
	event = Gdk.Event.new(Gdk.EventType.SCROLL)
	event.scroll.window = view.get_window()
	event.scroll.send_event = 1
	event.scroll.time = Gtk.get_current_event_time()
	event.scroll.x = view.get_allocated_width() * 0.6
	event.scroll.y = view.get_allocated_height() * 0.6
	wheel.n += 1
	event.scroll.direction = Gdk.ScrollDirection.DOWN if (wheel.n // 24) % 2 == 0 else Gdk.ScrollDirection.UP
	event.set_device(Gdk.Display.get_default().get_default_seat().get_pointer())
	view.event(event)
	return True


wheel.n = 0


WATCH = r'''(function () {
	const b = (window.__bench = { raf: 0, hovers: 0, moves: 0, back: 0, backPx: 0, stop: false });
	const el = [...document.querySelectorAll('main, body, html')].find((e) => e.scrollHeight > e.clientHeight + 4 && getComputedStyle(e).overflowY !== 'hidden') || document.scrollingElement;
	let prev = el.scrollTop, dir = 0;
	const tick = () => {
		b.raf++;
		const y = el.scrollTop, step = y - prev;
		// Moving against the way it has been going, by more than a pixel:
		// the content stepped back. A deliberate turn of the wheel flips the
		// way for good; a jump flips it for a frame or two.
		if (dir && step && Math.sign(step) !== dir && Math.abs(step) > 1) { b.back++; b.backPx = Math.max(b.backPx, Math.abs(step)); }
		if (step) dir = Math.sign(step);
		prev = y;
		if (!b.stop) requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
	let last = null;
	document.addEventListener('mouseover', (e) => {
		const target = e.target.closest('a, button, li, article') || e.target;
		if (!b.stop && target !== last) b.hovers++;
		last = target;
	}, true);
	document.addEventListener('transitionrun', (e) => {
		if (!b.stop && /transform|translate|scale/.test(e.propertyName)) b.moves++;
	}, true);
})()'''


def report():
	view.evaluate_javascript('window.__bench.stop = true; JSON.stringify(window.__bench)', -1, None, None, None, finish)
	return False


def finish(v, res):
	global measuring
	measuring = False
	value = v.evaluate_javascript_finish(res)
	page = json.loads(value.to_string()) if value and value.is_string() else {'raf': 0, 'hovers': -1, 'moves': -1}
	gaps = sorted(b - a for a, b in zip(painted, painted[1:]))
	if not gaps:
		print(json.dumps({'error': 'nothing painted'}))
		Gtk.main_quit()
		return
	monitor = Gdk.Display.get_default().get_monitor_at_window(win.get_window())
	hz = monitor.get_refresh_rate() / 1000
	refresh = 1000 / hz
	at = lambda p: gaps[min(len(gaps) - 1, int(len(gaps) * p))]  # noqa: E731
	print(json.dumps({
		'screen_hz': round(hz),
		'painted_fps': round(len(painted) / seconds),
		# How often the page itself updated (animation callbacks).
		'page_fps': round(page['raf'] / seconds),
		'gap_p50': round(at(0.5), 1),
		'gap_p90': round(at(0.9), 1),
		'gap_max': round(gaps[-1], 1),
		# A gap of two refreshes or more is a frame the eye sees repeated.
		'stutters': sum(1 for g in gaps if g > refresh * 1.9),
		'hovers': page['hovers'],
		# Frames where the content stepped back against the scroll, and the biggest step.
		'backsteps': page.get('back', -1),
		'backstep_px': page.get('backPx', -1),
		'moves': page['moves'],
		'near60': near60,
		'renderer': 'software' if os.environ.get('WEBKIT_DISABLE_DMABUF_RENDERER') else 'gpu',
	}))
	Gtk.main_quit()


def start():
	global measuring
	measuring = True
	view.evaluate_javascript(WATCH, -1, None, None, None, None, None)
	pointer()
	win.get_window().get_frame_clock().connect('after-paint', after_paint)
	GLib.timeout_add(int(1000 / notches), wheel)
	GLib.timeout_add(int(seconds * 1000), report)
	return False


def gpu_page(v, res):
	value = v.evaluate_javascript_finish(res)
	print(value.to_string() if value and value.is_string() else '(nothing)')
	Gtk.main_quit()


def loaded(v, event):
	if event == WebKit2.LoadEvent.FINISHED:
		if url == 'webkit://gpu':
			GLib.timeout_add(500, lambda: (view.evaluate_javascript('document.body.innerText', -1, None, None, None, gpu_page), False)[1])
			return
		if setup:
			GLib.timeout_add(1500, lambda: (view.evaluate_javascript(setup, -1, None, None, None, None, None), False)[1])
		GLib.timeout_add(11500 if setup else 3000, start)


view.connect('load-changed', loaded)
view.load_uri(url)
GLib.timeout_add(90000, Gtk.main_quit)
Gtk.main()
