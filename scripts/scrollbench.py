#!/usr/bin/env python3
"""Measures how smoothly a page scrolls in WebKitGTK, the engine every Sol
app's window uses on Linux. It loads a URL in a real window, runs a snippet
to get the screen ready (pair, open a page), then scrolls the app's pane up
and down for a few seconds while timing every frame, and prints the frame
times: the median, the slow ones, and how many frames were dropped.

    scripts/scrollbench.py URL [SETUP_JS [SECONDS [SELECTOR [VARIANT_JS]]]]

SETUP_JS runs 1.5 s after the page loads; the scroll starts 10 s after that
(by then the screens are paired and drawn). SELECTOR is the element that
scrolls (default: the Shell's pane, `main`). VARIANT_JS runs right before the
scroll, to try a change (remove an element, add a style) without a rebuild.
BENCH_W and BENCH_H set the window's size; GDK_BACKEND picks wayland or x11
(the apps run on wayland, where frames come at the monitor's rate); BENCH_SHOT
saves a PNG of the window after the scroll, to see that the page drew at all.
"""
import json
import os
import sys

os.environ.setdefault('GDK_BACKEND', 'x11')
import gi  # noqa: E402

gi.require_version('WebKit2', '4.1')
gi.require_version('Gtk', '3.0')
from gi.repository import GLib, Gtk, WebKit2  # noqa: E402

url = sys.argv[1]
setup = sys.argv[2] if len(sys.argv) > 2 else ''
seconds = float(sys.argv[3]) if len(sys.argv) > 3 else 4
selector = sys.argv[4] if len(sys.argv) > 4 else 'main'
variant = sys.argv[5] if len(sys.argv) > 5 else ''

BENCH = r"""
(function (selector, seconds) {
	const el = document.querySelector(selector) || document.scrollingElement;
	const frames = [];
	let last = performance.now();
	const start = last;
	let dir = 1;
	el.scrollTop = 0;
	function step(now) {
		frames.push(now - last);
		last = now;
		// 18 px a frame: a brisk wheel scroll.
		el.scrollTop += 18 * dir;
		if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) dir = -1;
		if (el.scrollTop <= 0) dir = 1;
		if (now - start < seconds * 1000) requestAnimationFrame(step);
		else {
			frames.shift();
			frames.sort((a, b) => a - b);
			const at = (p) => frames[Math.min(frames.length - 1, Math.floor(frames.length * p))];
			// A frame that took over 1.6× the typical one missed a refresh.
			const late = frames.filter((f) => f > at(0.5) * 1.6).length;
			window.__bench = JSON.stringify({
				hz: Math.round(1000 / at(0.5)),
				frames: frames.length,
				p50: +at(0.5).toFixed(1),
				p90: +at(0.9).toFixed(1),
				p99: +at(0.99).toFixed(1),
				max: +frames[frames.length - 1].toFixed(1),
				late,
				scrollable: el.scrollHeight - el.clientHeight
			});
		}
	}
	requestAnimationFrame(step);
})(%s, %s);
"""

win = Gtk.Window(title='scrollbench')
win.set_default_size(int(os.environ.get('BENCH_W', 1266)), int(os.environ.get('BENCH_H', 840)))
view = WebKit2.WebView()
settings = view.get_settings()
settings.set_enable_write_console_messages_to_stdout(False)
win.add(view)
win.show_all()


def read(v, res):
	value = v.evaluate_javascript_finish(res)
	text = value.to_string() if value and value.is_string() else ''
	if not text or text == 'undefined':
		GLib.timeout_add(250, lambda: (view.evaluate_javascript('window.__bench', -1, None, None, None, read), False)[1])
		return
	result = json.loads(text)
	print(json.dumps(result))
	shot = os.environ.get('BENCH_SHOT')
	if shot:
		def done(v2, res2):
			v2.get_snapshot_finish(res2).write_to_png(shot)
			Gtk.main_quit()
		view.get_snapshot(WebKit2.SnapshotRegion.VISIBLE, WebKit2.SnapshotOptions.NONE, None, done)
		return
	Gtk.main_quit()


def bench():
	if variant:
		view.evaluate_javascript(variant, -1, None, None, None, None, None)
	view.evaluate_javascript(BENCH % (json.dumps(selector), seconds), -1, None, None, None, None, None)
	GLib.timeout_add(int(seconds * 1000) + 300, lambda: (view.evaluate_javascript('window.__bench', -1, None, None, None, read), False)[1])
	return False


def loaded(v, event):
	if event == WebKit2.LoadEvent.FINISHED:
		if setup:
			GLib.timeout_add(1500, lambda: (view.evaluate_javascript(setup, -1, None, None, None, None, None), False)[1])
		GLib.timeout_add(11500 if setup else 3000, bench)


view.connect('load-changed', loaded)
view.load_uri(url)
GLib.timeout_add(90000, Gtk.main_quit)
Gtk.main()
