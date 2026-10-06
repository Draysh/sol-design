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

## Anatomy of a world's main screen

A world's first screen is a `<Sheet>`. It has six parts:

| Part | What it is | Rule |
| --- | --- | --- |
| Body | The world's photograph, lit from one side | Cropped so the light's edge crosses the frame; never centred and whole |
| Name and reticle | Centred | Two arcs and an axis at the real tilt (`worlds.ts`) |
| Callout | Dotted leader and a short list | What comes next in this world; three lines at most, `Thing = state` |
| Moon links | `( • ) Name` | Moons are doors to their own apps; shown only when that app is up |
| Data rows | Two or three blocks along the bottom | Seven lines at most in total |
| Corner marks | Crosshairs above the outer data blocks | Frame the sheet without drawing a box |

Everything below the sheet is the app's working surface: `Card`s in a grid.

On a phone the body rises from the bottom, lit from above, the callout and
corner marks drop out, and the data rows keep two blocks.

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

- Margins grow from 16 px on phones to 96 px on wide screens (`--margin`).
- Spacing steps: 4, 8, 16, 24, 40, 64, 112 (`--s-1` … `--s-7`).
- Cards sit in an auto-fit grid, `minmax(300px, 1fr)`, 24 px gaps.
- Corners are square. Only discs and round icon buttons are round.
- Lines are 1 px, never thicker. No drop shadows: light comes from bodies.
- Every target is at least 44 px (`--target`).

## Components

| Component | Use it for |
| --- | --- |
| `Shell` | The root layout of every app: the bar (its sections, status on the right), notices and grain |
| `Sheet` | A world's first screen (anatomy above) |
| `PageHead` | The top of a working page: title, one line of lead, the page's action |
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

1. The root layout is `<Shell world="<id>" links={…}>`, with the app's own
   sections in the bar and its connection status in `actions`.
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

Sol's own web app follows the same rules, with `world="sol"`.

## Adding a world

Add an entry to `src/lib/worlds.ts` and a photo to `src/lib/assets/`:

- **Photo:** public domain or openly licensed (credit it in `CREDITS.md`),
  cropped tight to the disc, square, about 1200 px, WebP.
- **Colour:** sample the glow from the photo's lit limb.
- **Tilt:** the body's real axial tilt.
- **Hero placement:** in a 1600 × 900 frame, keep the centre (800, 450) clear
  for the name, and let the body run off at least one edge.
