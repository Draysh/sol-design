#!/usr/bin/env python3
"""Renders a page in WebKitGTK, the engine every Sol app's window uses on
Linux, and saves a PNG. Chromium doesn't show WebKitGTK's quirks, so check
anything visual here before calling it done.

    scripts/shot.py URL OUT.png [WIDTH HEIGHT [WAIT_S [JS]]]

JS runs 1.5 s after the page loads (to sign in to a preview, click around).
"""
import os
import sys

os.environ['GDK_BACKEND'] = 'x11'  # offscreen rendering needs X11
import gi  # noqa: E402

gi.require_version('WebKit2', '4.1')
gi.require_version('Gtk', '3.0')
from gi.repository import GLib, Gtk, WebKit2  # noqa: E402

url, out = sys.argv[1], sys.argv[2]
w, h = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (1266, 840)
wait = float(sys.argv[5]) if len(sys.argv) > 5 else 4
js = sys.argv[6] if len(sys.argv) > 6 else None

win = Gtk.OffscreenWindow()
view = WebKit2.WebView()
view.set_size_request(w, h)
win.add(view)
win.show_all()


def snap():
    def done(v, res):
        v.get_snapshot_finish(res).write_to_png(out)
        Gtk.main_quit()

    view.get_snapshot(WebKit2.SnapshotRegion.VISIBLE, WebKit2.SnapshotOptions.NONE, None, done)
    return False


def loaded(v, event):
    if event == WebKit2.LoadEvent.FINISHED:
        if js:
            GLib.timeout_add(1500, lambda: (view.evaluate_javascript(js, -1, None, None, None, None, None), False)[1])
        GLib.timeout_add(int(wait * 1000), snap)


view.connect('load-changed', loaded)
view.load_uri(url)
GLib.timeout_add(90000, Gtk.main_quit)
Gtk.main()
