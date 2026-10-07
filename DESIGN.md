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
| Sidebar | The world's disc and name, its sections, its status at the bottom | 228 px, a rail of 60 px on narrow windows. Chrome: not selectable |
| Current section | A line of the world's light down its left edge | Light means attention; nothing else in the chrome is coloured |
| Pane | The app's screens | Scrolls on its own; the window and the chrome never scroll |
| Footer | A bar along the bottom of the pane | For what is always there, e.g. a player's transport |

`Ctrl` (or `⌘`) + `1`…`9` jumps to a section. The pane scrolls back to the
top when `path` changes, so give the Shell the current path.

## The band

A world's first screen starts with a `<Sheet>`: a band across the top of
the pane, 260–400 px tall, then a strip of facts. It is a header, not a
hero: the working surface starts right under it.

| Part | What it is | Rule |
| --- | --- | --- |
| Body | The world's photograph, lit from one side | Cropped so the light's edge crosses the band; never centred and whole |
| Name and reticle | Centred | Two arcs and an axis at the real tilt (`worlds.ts`) |
| Callout | Dotted leader and a short list | What comes next in this world; three lines at most, `Thing = state` |
| Moon links and the main action | Under the name | Moons are doors to their own apps; shown only when that app is up |
| Data rows | A strip under the band, two or three blocks | Seven lines at most in total |

Everything below is the app's working surface: `Card`s in a grid, each
other page starting with a `<PageHead>` toolbar that stays put while the
page scrolls.

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
glow. A 9 % film grain covers everything.

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
| `PageHead` | A page's toolbar: title, a quiet line, the page's action; stays put while the page scrolls |
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
| `MoonLink` | A link to a moon's app |
| `Widget` | Drawing a `WidgetView` (Sol's overview does this for every world) |
| `Notices` / `notices.show()` | Short in-app messages at the top edge |
| `Loader` | The moment before data arrives |
| `WorldGlyph` | A world's crescent icon in lists and navigation |
| `AppUpdates` | A world app's Settings: installing itself, and its updates through Sol |

Focus is visible everywhere: buttons lock two corner ticks on; other controls
get a 1 px white outline 4 px out.

## Motion

| Name | Duration | Used for |
| --- | --- | --- |
| Fade | 240 ms | Text, notices, colour changes |
| Lock | 120 ms | Focus ticks, checkboxes |
| Rise | about 1 s | A body appearing |

Moving between worlds is a page load, softened by a cross-document view
transition. Respect `prefers-reduced-motion`: the tokens drop to zero.

## Writing

- Short, plain sentences. Say what happened or what to do: "Couldn't save. Try
  again." not "An error occurred."
- Labels are nouns: `Streak`, `Due today`, `Now playing`.
- Values are what is true now: `12 days`, `42 cards`, `2:14 of 5:06`.
- Callout lines are `Thing = state`: `Walk = done`.
- Event summaries (shown in Sol's activity feed and notifications) are one
  sentence written by the app: `Did “Walk outside”, 4 days in a row`.
- No exclamation marks, no emoji.

## Building an app the same way

Sol is the one server; each world is an app of its own (a Tauri desktop app
now, a phone app later) that pairs with Sol and keeps its data there. Every
world's app is built the same way, starting from `sol-planet-template`:

1. The root layout is `<Shell world="<id>" links={…} path={…}>`, with the
   app's own sections in the sidebar, its connection status in `actions`,
   and anything that is always there (a player) in `footer`.
2. The first screen is a `<Sheet>` with the world's callout and data rows.
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
renders a page in WebKitGTK and saves it; look at that before calling a
screen done.
