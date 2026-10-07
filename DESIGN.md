# Sol design language: Observatory

Every Sol app looks and behaves as if it came from one observatory. This page
holds the rules. The components in this package already follow them, so the
fastest way to obey a rule is to use the component instead of rebuilding it.

The visual reference is the brand canvas (direction 03C, "Observatory"):
mission photographs of real bodies lit from one side on pure black, a name
inside a reticle, short callouts, and facts written as `Label: value`.

## Principles

1. **One light.** Every body is lit from one side. Darkness is the default;
   light means attention.
2. **Black is space.** The ground is pure black. Groups get corner ticks, not
   boxes. Nothing is filled except the screen's main action.
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
page scrolls. The toolbar is solid black with a short fade under it, never a
blur: what scrolls under it must cost the compositor nothing.

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

| Token | Value | Use |
| --- | --- | --- |
| `--space` | `#000000` | Every background |
| `--text` | `#F2F2F2` | Text, primary button fill |
| `--text-value` | `#BDBDBD` | Values and reading text |
| `--text-quiet` | `#A8A8A8` | Secondary facts, units, dates |
| `--text-faint` | `#5A5A5A` | Disabled |
| `--line` / `--line-mid` / `--line-strong` | white at 8 / 14 / 45 % | Hairlines |
| `--danger` / `--danger-text` | `#FF6B5A` / `#FF8A7A` | Errors only |
| `--world` | the world's colour | Glow, glyphs, one accent line. Never text, never fills |

Colour comes only from the bodies. Each world's colour is sampled from its own
photograph:

| World | Colour | Tilt | Light from | App |
| --- | --- | --- | --- | --- |
| Sol | `#FF7A2E` | 7.25° | (the source) | The hub |
| Terra | `#8EC5FF` | 23.44° | right | Habits, diary and wellbeing |
| Luna | `#FFFFFF` | 6.68° | left | Terra's quieter twin |
| Saturn | `#E6CF9E` | 26.73° | (photo) | Movies, series and anime |
| Titan | `#FFB06A` | 0.3° | upper right | Recommendations, made at home |
| Mercury | `#F2F2F2`, split red/blue rim | 0.03° | above | Japanese |
| Neptune | `#6F9BFF` | 28.32° | upper left | Music through Navidrome |
| Triton | `#CFE8FF` | 157° (retrograde) | upper left | Radio and discovery |

The lighting recipe (in `Body.svelte`): the photo is clipped to a circle; a
blurred black circle offset away from the light makes a soft terminator; a
blurred stroke in the world's colour, masked to the lit side, makes the limb
glow. A film grain of dark specks covers everything: invisible over black,
a fine texture over photographs and light type. It is one plain layer with
no blend mode, so scrolling under it is free.

## Layout

- Content sits close to its chrome: the pane's margin is 16–40 px
  (`--margin`), never the wide margins of a web page.
- Spacing steps: 4, 8, 16, 24, 40, 64, 112 (`--s-1` … `--s-7`). A page
  pads `var(--s-4) var(--margin) var(--s-6)`.
- Cards sit in an auto-fit grid, `minmax(300px, 1fr)`, 24 px gaps.
- Corners are square. Only discs and round icon buttons are round.
- Lines are 1 px, never thicker. No drop shadows: light comes from bodies.
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
| `Card` | A group of related things, marked by corner ticks |
| `Button` | `primary` once per screen for the main action; `ghost` otherwise; `quiet` for low-stakes actions; `round` for icon-only controls (always with `aria-label`) |
| `Field` | Text input with label; errors say what to do |
| `Select` | A choice from a short list, underlined like a field |
| `TextArea` | Writing more than a line, e.g. a diary; grows as you type |
| `Toggle` | An on/off setting that applies at once or with its form |
| `Check` | One checklist row |
| `Progress` | A position in something (track, episode, deck) |
| `RingGauge` | Part of a whole of a whole (episode of season of show) |
| `DataRows` | `Label: value` facts |
| `Callout` | A short list leading from a body |
| `MoonLink` | A link to a moon's app (or a moon's way to its planet); `onclick` opens the app itself |
| `LinkStatus` | The bottom of a world app's sidebar: in sync, sending, or offline with what waits; `busy` names other work, `warn` something wrong beside Sol |
| `Widget` | Drawing a `WidgetView` (Sol's overview does this for every world) |
| `Notices` / `notices.show()` | Short in-app messages at the top edge |
| `Loader` | The moment before data arrives |
| `WorldGlyph` | A world's crescent icon in lists and navigation |
| `AppUpdates` | A world app's Settings: installing itself, and its updates through Sol |
| `WithPlanet` | A moon's Settings: running with its planet, without a window (`orbit::moons`) |

Focus is visible everywhere: buttons lock two corner ticks on; other controls
get a 1 px white outline 4 px out.

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
rises and the Reticle draws itself; Cards lock their ticks on; Check draws
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

Sol is the one server; each world is an app of its own (a Tauri desktop app
now, a phone app later) that pairs with Sol and keeps its data there. Every
world's app is built the same way, starting from `sol-planet-template`:

1. The root layout is `<Shell world="<id>" links={…} path={…}>`, with the
   app's own sections (each with a `hint`) in the sidebar, its doors
   (`doors`: Sol, and its moons or planet, through `orbit::doors`), its
   search as `search`, its own keys as `shortcuts`, a `<LinkStatus>` in
   `actions`, and anything that is always there (a player) in `footer`.
2. The first screen is a `<Sheet>` with the world's callout and data rows;
   a planet's shows its installed moons under the name, a moon's its planet.
3. Other pages start with a `<PageHead>`; everything else is `Card`s in the
   standard grid, built from these components. No custom colours, fonts,
   shadows or rounded boxes.
4. One `primary` button per screen at most.
5. Data comes from Sol through `orbit::client` on the app's Rust side; the UI
   never talks to Sol directly.
6. Every event the app posts carries a `summary` sentence.
7. Widgets for Sol's overview are `WidgetView`s the app pushes; items with
   `toggle` can be ticked from the overview and arrive in the app's inbox.
8. The app's Settings page has an `<AppUpdates>` card: the app installs
   itself from there and takes its updates through Sol (`orbit::updates`).
9. A moon runs by itself whenever its planet runs (`orbit::moons`): nobody
   has to open it for its work to happen. Its Settings page has a
   `<WithPlanet>` card to turn that off on a computer.
10. The connections a world works best with are in its manifest
    (`connections`, with a `why` each): Sol offers them on the world's page
    and under Connections, to make in one click. A moon lists the ones to
    and from its planet. An app's own empty state names them too, and sends
    the person to Sol rather than explaining the builder.
11. The Connect screen (the first thing a new copy shows) says what the
    world is for under its name, in the tagline's words.

Sol's own web app follows the same rules, with `world="sol"`.

## Adding a world

Add an entry to `src/lib/worlds.ts` and a photo to `src/lib/assets/`:

- **Photo:** public domain or openly licensed (credit it in `CREDITS.md`),
  cropped tight to the disc, square, about 1200 px, WebP.
- **Colour:** sample the glow from the photo's lit limb.
- **Tilt:** the body's real axial tilt.
- **Hero placement:** in a 1600 × 900 frame, keep the centre (800, 450) clear
  for the name, and let the body run off at least one edge.

## Checking a screen

Every Sol app's window is WebKitGTK on Linux, which clips and composites
differently from Chromium. `scripts/shot.py URL out.png [W H [wait [js]]]`
renders a page in WebKitGTK (on Wayland, as the apps run) and saves it;
look at that before calling a screen done.

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
