# Sol design language: Observatory

Every Sol app looks and behaves as if it came from one observatory. This page
holds the rules. The components in this package already follow them, so the
fastest way to obey a rule is to use the component instead of rebuilding it.

Sol's web app and the worlds' desktop apps share one look: the same night and
day palettes (sol-quick's `Theme.qml`, this package's `tokens.css`), the same
corners, the same raised panels, and the same lit bodies (sol-quick's
`body.frag`, ported to WebGL in `body-gl.ts`) from the same world data
(`Worlds.qml`, from which `worlds.gen.ts` is written).

The visual reference is the brand canvas (direction 03C, "Observatory"):
mission photographs of real bodies lit from one side on a night sky, a name
inside a reticle, short callouts, and facts written as `Label: value`.

## Principles

1. **One light.** Every body is lit from one side. Darkness is the default;
   light means attention.
2. **Night is space.** The ground is a night sky in three depths, tinted a
   little by the world: the chrome deepest, the pane, and panels raised off
   it. By day it is a pale sky. Nothing is filled except the screen's main
   action.
3. **Name in the reticle.** Every world names itself inside a reticle whose
   axis leans at that world's real axial tilt.
4. **Label: value.** Facts read as label and value. Semibold says what it is;
   light says what it is now.

## The frame

Every app is a window, not a page. `<Shell>` draws the frame:

| Part | What it is | Rule |
| --- | --- | --- |
| Sidebar | The world's disc and name, its sections, its doors, its status at the bottom | 228 px, a rail of 60 px on narrow windows. Chrome: not selectable |
| Current section | A line of the world's light down its left edge | Light means attention; nothing else in the chrome is coloured |
| Doors | Under the sections: Sol, and the moons or planet this world works with, each a glyph and a name | Opening one opens that app (the Rust side does it, `orbit::doors`); only apps installed on this computer are doors |
| Status | The bottom of the sidebar: `LinkStatus`, one line on where the app stands with Sol | In sync, sending, or offline with what waits |
| Pane | The app's screens | Scrolls on its own; the window and the chrome never scroll |
| Footer | A bar along the bottom of the pane | For what is always there, e.g. a player's transport |

`Ctrl` (or `⌘`) + `1`…`9` jumps to a section, `/` opens the app's search
(give the Shell its path as `search`) and `?` opens a sheet of the keys:
the Shell's own, then the app's (`shortcuts`), so nobody has to guess what
`Space` does here. A new page starts at the top of the pane and settles
into it, so give the Shell the current path. The light glides from the old
section to the new.

Every section carries a `hint`: one line on what it is for (`Timeline`:
"What's on the way, week by week"), shown on hover and read out where the
rail shows only a dot. The world's own tagline sits on its name at the top.
Names alone are for people who know the app; the hint is for the day they
don't.

### Going back

A page whose path isn't a section's (a title from the library, an album)
was opened from somewhere, and the Shell offers the way back by name:
`← Library`. The `PageHead` shows it first in its bar; a page whose top is
a picture (a backdrop, a hero) gets it floating over the pane's corner; a
page with a header of its own places a `<WayBack />` there. `Alt` + `←` /
`→` and the mouse's back and forward buttons go back and forth on every
page (on Linux the app passes the buttons on: `orbit::mouse`).

Going back lands where you left off: the Shell keeps the pane's scroll for
every step of the history and returns to it once the page is tall enough.
So a page must come back the same height it was left at:

- what someone typed or chose that shapes the page (a filter, a search, a
  sort) is kept with SvelteKit's `snapshot()` from `$app/navigation`;
- what was loaded bit by bit ("Show more", "Earlier") is kept in the
  page's `<script module>` and shown again, not fetched from the start;
- a change that only marks things (now tracked, now a favourite) marks
  them in place and keeps what's loaded.

## The band

A world's first screen starts with a `<Sheet>`: a band across the top of
the pane, 260–400 px tall, then a strip of facts. It is a header, not a
hero: the working surface starts right under it.

| Part | What it is | Rule |
| --- | --- | --- |
| Body | The world's photograph, lit from one side | Cropped so the light's edge crosses the band; never centred and whole |
| Name and reticle | Centred | Two arcs and an axis at the real tilt (`worlds.ts`) |
| Callout | Dotted leader and a short list | What comes next in this world; three lines at most, `Thing = state` |
| Moon links and the main action | Under the name | Doors to the world's moons, or from a moon to its planet; shown only when that app is installed here |
| Data rows | A strip under the band, two or three blocks | Seven lines at most in total |

The band arrives in order: the body rises, the reticle draws itself around
the name, then the callout and the strip of facts settle after it.

Everything below is the app's working surface: `Card`s in a grid, each
other page starting with a `<PageHead>` toolbar that stays put while the
page scrolls. The toolbar is the deep sky (`--deep`) with a short fade under
it, never a blur: what scrolls under it must cost the compositor nothing.

On a phone the body rises from the bottom, lit from above, the callout
drops out, and the strip keeps two blocks.

## Type

One family, **Outfit**, self-hosted from `@fontsource-variable/outfit`.
Weight does the work that other systems give to separate fonts.

| Role | Weight | Size | Case and tracking |
| --- | --- | --- | --- |
| Display (big numbers, covers) | 200 | 56–120 px | Capitals, +10 % |
| World name, headings | 400 | 34 px (sheet), 19 px (cards) | Capitals, +8 % |
| Label (what it is) | 600 | 11–11.5 px | Capitals, +5 to +14 % |
| Value (what it is now) | 300 | 11–11.5 px | Capitals, +5 % |
| Reading text | 300 | 15 px | Sentence case |

Capitals are for names, labels and values. Anything read in full (messages,
descriptions, diary entries) stays in sentence case. Japanese text in Mercury
uses `--font-jp` (Shippori Mincho) at the same size as the text around it.

## Light and colour

The sky comes in three depths, at night or by day, as in the apps
(`Theme.qml`): each is made from the sky and the world's colour, so each app's
sky is tinted a little by its own world. Elements that set a world of their
own (`--world` on the Shell, a Sheet) carry the class `sol-sky`, which works
the depths out again from it.

| Token | Night | Day | Use |
| --- | --- | --- | --- |
| `--night` | `#0C0E13` | `#EEF1F5` | The sky the depths are made from |
| `--space` | night with 5 % of the world | day with 7 % | The pane, where the work is |
| `--deep` | a step deeper (×0.69) | ×0.95 | The chrome: the sidebar, a Sheet's band and strip, a PageHead |
| `--raised` / `--raised-top` | white at 3.5 / 6 % over the pane | white at 70 / 90 % | A panel off the pane: a Card, lit a little from above |
| `--ink` | white | black | What overlays and hairlines are drawn in, at an alpha |
| `--line` / `--line-mid` / `--line-strong` | ink at 7 / 12 / 36 % | 9 / 15 / 36 % | Hairlines |
| `--text` / `--text-bright` | `#E6E8ED` / `#FFFFFF` | `#1B1F27` / `#07080B` | Text and values; names |
| `--text-value` | `#C3C7CF` | `#3B414D` | Reading text |
| `--text-quiet` / `--text-faint` | `#8B919D` / `#4F5561` | `#666D7B` / `#A6ABB5` | A fact's label, units, dates; disabled |
| `--text-world` | text with 55 % of the world | the world deepened, 75 % | A panel's title, the world's role |
| `--accent` | the world | no lighter than a mid-tone | Small marks: the current section's light, a glyph |
| `--danger` / `--danger-text` | `#FF6B5A` / `#FF8A7A` | `#D9493A` / `#B8352A` | Errors only |
| `--world` | the world's colour | | Glow, glyphs, one accent line. Never fills |

**Night and day.** Night is the default. Day comes from the desktop
(`prefers-color-scheme`), or from the person's choice in this browser:
`light.mode` (`light.svelte.ts`, shown as `<LightChoice />` on Sol's
Settings) is "system", "sun" (day from 07:00 to 19:00), "night" or "day",
the same choices the apps offer under Settings → On this device, kept in
`localStorage` as `sol.light`. What it comes to is set on the root as
`data-light`; Sol's `app.html` sets it before anything paints.

Colour comes only from the bodies. Each world's colour is sampled from its own
photograph:

| World | Colour | Tilt | Light from | App |
| --- | --- | --- | --- | --- |
| Sol | `#FF7A2E` | 7.25° | (the source) | The hub |
| Terra | `#8EC5FF` | 23.44° | right | Habits, diary and wellbeing |
| Luna | `#FFFFFF` | 6.68° | left | Terra's quieter twin |
| Saturn | `#E6CF9E` | 26.73° | (photo) | Movies, series and anime |
| Titan | `#FFB06A` | 0.3° | upper right | Recommendations, made at home |
| Mercury | `#F2F2F2` | 0.03° | above | Japanese |
| Neptune | `#6F9BFF` | 28.32° | upper left | Music through Navidrome |
| Triton | `#E4D1DD` | 157° (retrograde) | upper left | Radio and discovery |

The lighting (in `Body.svelte`, through `body-gl.ts`, the apps' `body.frag`
in WebGL): each world's photograph is laid on a sphere (`fit` says where the
disc is in the photograph, and turns one with a terminator of its own to face
its light) and lit by a distant sun from `light` at `phase`. The terminator is
soft where there is air (`air`) and crisp on rock; the night side is nearly
black, and by day lets the sky through, as the moon does in daylight; a world
with an atmosphere gets a thin rim of it on the sunny limb, and Titan's haze
rings even its night side. Sol is a star: its photograph tinted, a darker
limb, a corona. Saturn is its photograph used whole, laid on as light, so its
black becomes the sky. Terra and Luna follow the real sky (`skyOf`): Luna
shows tonight's phase, Terra the local hour. Clouds drift over Terra,
Neptune and Titan and Sol's corona flickers, on a body at least 120 px wide
while it is on screen. One hidden WebGL canvas draws every body on the page;
without WebGL the photograph shows clipped to a circle.

A film grain of dark specks covers everything: a fine texture over the night
and over photographs, a touch only by day. It is one plain layer with no
blend mode, so scrolling under it is free.

## Layout

- Content sits close to its chrome: the pane's margin is 16–40 px
  (`--margin`), never the wide margins of a web page.
- Spacing steps: 4, 8, 16, 24, 40, 64, 112 (`--s-1` … `--s-7`). A page
  pads `var(--s-4) var(--margin) var(--s-6)`.
- Cards sit in an auto-fit grid, `minmax(300px, 1fr)`, 24 px gaps.
- Corners come from one scale, so a thing inside another rounds with it (an
  inner corner is about the outer one less the room between them):
  `--radius-s` 4 px (a check's box, a pairing code, a link's focus ticks),
  `--radius-m` 6 px (a button, the way back, a sidebar row), `--radius` 10 px
  (a card, a notice), `--radius-l` 14 px (a big surface on its own: the keys
  sheet, the sign-in panel). Pills (a round button, a switch, a count) stay
  pills; hairlines and rules stay straight.
- Lines are 1 px, never thicker. No drop shadows on panels: they are raised
  by their light (a gradient from `--raised-top`) and a hairline; light comes
  from bodies.
- Pointer controls (buttons, fields, sidebar rows) are 36 px (`--control`);
  anything meant for a thumb stays 44 px (`--target`).
- Headings in the chrome are small capitals; big type is for names in
  reticles and for display figures, not for page titles.

## Components

| Component | Use it for |
| --- | --- |
| `Shell` | The frame of every app: the sidebar (sections, status at the bottom), the pane, an optional footer bar, notices and grain |
| `Sheet` | The band at the top of a world's first screen, and its strip of facts |
| `PageHead` | A page's toolbar: the way back on an opened page, title, a quiet line, the page's action; stays put while the page scrolls |
| `WayBack` | The way back, on an opened page with a header of its own (`PageHead` has it already) |
| `Body` | A lit world anywhere else, e.g. the dashboard's corner sun |
| `Reticle` | Framing a name or one key figure |
| `Card` | A group of related things: a raised panel, its title in the world's light over a hairline, ticks that lock on under the pointer |
| `Button` | `primary` once per screen for the main action; `ghost` otherwise; `quiet` for low-stakes actions; `round` for icon-only controls (always with `aria-label`) |
| `Field` | Text input with label; errors say what to do |
| `Select` | A choice from a short list, underlined like a field |
| `LightChoice` | Night or day in this browser: the apps' four choices |
| `TextArea` | Writing more than a line, e.g. a diary; grows as you type |
| `Toggle` | An on/off setting that applies at once or with its form |
| `Check` | One checklist row |
| `Progress` | A position in something (track, episode, deck) |
| `RingGauge` | Part of a whole of a whole (episode of season of show) |
| `DataRows` | `Label: value` facts |
| `Callout` | A short list leading from a body |
| `MoonLink` | A link to a moon's app (or a moon's way to its planet); `onclick` opens the app itself |
| `LinkStatus` | Left from the Svelte world apps, unused: the world apps' sidebar line is sol-quick's `LinkStatus` (`../quick`) |
| `Widget` | Drawing a `WidgetView` (Sol's overview does this for every world) |
| `Notices` / `notices.show()` | Short in-app messages at the top edge |
| `Loader` | The moment before data arrives |
| `WorldGlyph` | A world's crescent icon in lists and navigation |
| `AppUpdates` | Left from the Svelte world apps, unused: the world apps' card is sol-quick's `AppUpdates` |
| `WithPlanet` | Left from the Svelte world apps, unused: every moon is carried in its planet's app now |

Focus is visible everywhere and follows the shape it marks: buttons and links
lock two corner ticks on, bent round their own corners a few pixels out
(`.sol-ticks`, `--tick-radius`); a switch and a check get a hairline round
the switch or the box; fields light their underline; anything else gets a
1 px outline 4 px out, rounded with it.

## Motion

Things arrive; nothing moves for its own sake. Motion marks a change (a
screen opening, a value changing, a tick locking on) and then stops. Only
the Loader and a busy button keep moving, because the app is.

| Name | Token | Duration | Used for |
| --- | --- | --- | --- |
| Fade | `--fade` | 240 ms | Text, notices, colour changes; `.sol-fade` on text that changed |
| Lock | `--lock` | 120 ms | Focus ticks, checkboxes, switches, a press |
| Settle | `--settle` | 420 ms | Something taking its place: a screen, a card, a row (`.sol-settle`) |
| Rise | `--rise` | 900 ms | A body appearing, a figure counting up (`use:count`), an arc drawing |
| Stagger | `--stagger` | 28 ms | Between things that arrive together (`.sol-stagger`), at most 400 ms late |

The easing for settling and rising is `--ease-out`: fast out, a long soft
landing. The components already move this way: the Shell's light glides to
the new section and each screen settles into the pane; the Sheet's body
rises and the Reticle draws itself; a Card's ticks lock on under the pointer; Check draws
its tick; Progress fills to its value; RingGauge draws its arcs; a Field's
line lights from the left on focus; a Notice drops in and a hairline runs
out as its time does; DataRows fade a value that changed.

Rules for an app's own motion:

- Animate opacity and transforms only. Never width, height, filters or
  blur: the pane must keep scrolling at the monitor's full rate (170 Hz on
  a fast screen, 6 ms a frame).
- A list staggers its first two dozen items and lets the rest appear at
  once; a wall of covers must not take a second to fill.
- Nothing loops, except the Loader and a busy control.
- Moving between worlds is a page load, softened by a cross-document view
  transition.
- Respect `prefers-reduced-motion`: every token drops to zero, and
  `use:count` sets its figure at once.

## Writing

- Short, plain sentences. Say what happened or what to do: "Couldn't save. Try
  again." not "An error occurred."
- Labels are nouns: `Streak`, `Due today`, `Now playing`.
- Values are what is true now: `12 days`, `42 cards`, `2:14 of 5:06`.
- Callout lines are `Thing = state`: `Walk = done`.
- Event summaries (shown in Sol's activity feed and notifications) are one
  sentence written by the app: `Did “Walk outside”, 4 days in a row`.
- Section hints say what the section is for, in one line without a full
  stop: `Every episode and film, as you watched them`.
- A door is named for the world, with what it is for after a dot when that
  helps: `Titan · what to watch next`, `Sol · settings and connections`.
- No exclamation marks, no emoji.

## Interactions

- **Something that can't be undone asks once, in place.** The control says
  so with an ellipsis (`Remove…`, `Unpair…`, `Archive…`) and, pressed, turns
  into the deed and a way out: `Remove it` · `Keep`. A line above says what
  goes with it ("Its status, rating, notes and watched episodes go too").
  Nothing else asks twice. A dialog is for naming something, not for
  confirming.
- **A screen that waits shows the Loader**, centred in `.sol-loading`, never
  an empty pane and never an empty state that isn't true yet ("Nothing
  learned" while the taste is still loading).
- **Every failure says why.** A command that fails in a handler becomes a
  notice titled for what didn't happen (`Not saved`, `Not ticked`), with
  the reason as its body. A load that fails outside a handler reaches
  `watchUnhandled` (called once in the layout) and becomes a notice too, so
  a blank card never stays silent.
- **Every list has an empty state** that says what would fill it and where
  that happens ("Nothing watched yet. Ticks appear here as you make them").
- **A long piece of work shows its progress** (`Progress`) or at least that
  it is going on (a busy button, a line in `LinkStatus`), and the screen
  never waits for it.

## Building an app the same way

Sol is the one server; each world is an app of its own (a desktop app in
Rust and Qt Quick now, a phone app later) that pairs with Sol and keeps its
data there. Every world's app is built the same way, starting from
`kit/template`, with the screens from sol-quick's `Sol.Design` module (the
same language as this package, drawn by Qt's scene graph: real blur behind
the Connect screen, a shader lighting every world's photo, glows that are
light, not pictures of light):

1. The window is an `AppWindow` with the app's own sections (each with a
   `hint`) in the sidebar, its search as `search`, its own keys as
   `shortcuts`, and anything that is always there (a player) as `footer`.
   The doors (Sol, and its moons or planet, through `orbit::doors`) and the
   `LinkStatus` come by themselves.
2. The first screen is a `Sheet` with the world's callout and data rows;
   a planet's shows its installed moons under the name, a moon's its planet.
3. Other pages are `Screen`s that start with a `PageHead`; everything else
   is `Card`s in the standard `Grid`, built from these components. No
   custom colours, fonts, shadows or corners: every token is in
   `Theme`.
4. One `primary` button per screen at most.
5. Data comes from Sol through `orbit::link::Link` on the app's Rust side,
   called from QML as commands (`Sol.call`); the UI never talks to Sol
   directly.
6. Every event the app posts carries a `summary` sentence.
7. Widgets for Sol's overview are `WidgetView`s the app pushes; items with
   `toggle` can be ticked from the overview and arrive in the app's inbox.
8. The app's Settings page has an `AppUpdates` card: the app installs
   itself from there and takes its updates through Sol (`orbit::updates`).
9. A moon runs whenever its planet runs: its planet's app carries it (its
   pages in the planet's window, its work in the planet's process), so
   nobody has to open it for its work to happen.
10. The connections a world works best with are in its manifest
    (`connections`, with a `why` each): Sol offers them on the world's page
    and under Connections, to make in one click. A moon lists the ones to
    and from its planet. An app's own empty state names them too, and sends
    the person to Sol rather than explaining the builder.
11. The Connect screen (the first thing a new copy shows) says what the
    world is for under its name, in the tagline's words.
12. Lists arrive with the stagger (`Settle`); a card's figures count up
    (`Display`); bars grow from their baseline; a page's hero drifts a
    little with the scroll. Motion says what changed and no more: the
    durations in `Theme` (`fade`, `lock`, `settle`, `rise`) are the only ones.

Sol's own web app follows the same rules, with `world="sol"`, from this
package's Svelte components.

## Adding a world

A world's data lives in one place, sol-quick's `qml/Worlds.qml`: add its
entry there (name, role, tagline, colour, tilt, photograph, `fit`, `air`,
the hero, portrait and companions on the sheet, the callout), then write
this package's copy from it and give it a photograph here too:

```sh
node scripts/worlds-from-qml.mjs   # writes src/lib/worlds.gen.ts; commit it
```

and add the photograph to `src/lib/assets/` and to `pictures` in
`src/lib/worlds.ts`, under the name `Worlds.qml` gives it.

- **Photo:** public domain or openly licensed (credit it in `CREDITS.md`),
  cropped tight to the disc, square, about 1200 px, WebP here, PNG in
  sol-quick, the same crop in both (`fit` is measured on it).
- **Colour:** sample the glow from the photo's lit limb.
- **Tilt:** the body's real axial tilt.
- **Hero placement:** in a 1600 × 900 frame, keep the centre (800, 450) clear
  for the name, and either show the body whole beside it (r about 170) or
  let it rise as a horizon from the band's bottom edge.

## Checking a screen

A world's app draws its own screens (Qt Quick), so check one in the app:
`SOL_PREVIEW=1 SOL_SHOT=out.png SOL_SHOT_AFTER=2500 SOL_SHOT_PATH=/ cargo run`
saves the page as it renders, and `journalctl --user -S -1min | grep
'<world>['` shows the QML errors, which never reach the terminal.

Sol's own web app runs in any browser: look at it on a Sol started on a
throwaway data folder (`sol serve --data-dir <tmp> --bind 127.0.0.1:<port>`,
an account made with `SMOKE_FRESH=1 SETUP_CODE=<code from its log>
scripts/smoke.sh`), night and day, and at the brand book (`npm run build`,
then serve `build/`). The rest of this section is from when the worlds' apps
were Svelte pages in WebKitGTK, which clips and composites differently from
Chromium: `scripts/shot.py URL out.png [W H [wait [js]]]` renders a page in
WebKitGTK (on Wayland) and saves it.

`scripts/scrollbench.py URL [setup-js [seconds]]` scrolls the pane the way a
person does, with mouse-wheel notches and the pointer resting over it, and
reports the frames the window actually painted, how often something under
the still pointer was newly hovered, and how many movements that set off.
Run it before and after anything that could make scrolling feel rough: a
hover that moves things, a blur, a blend mode, a filter.

Two things it found, so nobody looks for them again:

- While the pane scrolls, the Shell makes its content ignore the pointer
  until the pane has been still for a moment. Otherwise covers lifting and
  dropping as they slide under a still pointer read as the page jumping.
- WebKitGTK paces its frames on the display's vertical blank, which it
  waits for with libdrm's `drmWaitVBlank`. Where the driver has no such
  thing (NVIDIA's doesn't) or WebKit can't match the monitor to a CRTC, it
  falls back to a timer fixed at 60 frames a second whatever the screen
  does, and no setting raises it; `WEBKIT_DISABLE_DMABUF_RENDERER` only
  swaps the GPU for software rendering at the same rate. It is not Tauri
  or GTK3: GTK follows the compositor's frame clock. The apps' answer is
  orbit's `frames` module: each app exports its own `drmWaitVBlank`, which
  paces at the CRTC's real rate when libdrm's fails, and turns off WebKit's
  preference for page updates near 60 a second. The bench runs the system
  WebKit without the apps' binary, so to measure what the apps do, preload
  the shim built from orbit: `LD_PRELOAD=…/libframes.so` (its `frames`
  example). `BENCH_GPU=1` prints `webkit://gpu`, which names the vblank
  monitor WebKit is using and why; `WEBKIT_FORCE_VBLANK_TIMER=1` brings the
  60 Hz timer back, to compare.
