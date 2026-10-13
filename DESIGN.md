# Sol design language: Yozora (夜空)

Every Sol page looks as if it came from an anime film's evening. This page
holds the rules for Sol's web app. The components in this package already
follow them, so the fastest way to obey a rule is to use the component
instead of rebuilding it.

Sol's web app and the worlds' desktop apps share one look, described in
full in the workspace's `docs/yozora.md`: the same flavours, scale and
motion (sol-quick's `Theme.qml`, from which `scripts/look-from-qml.mjs`
writes this package's `tokens.css` and `look.gen.ts`), the same faces
(sol-quick's fonts, cut for the web by `scripts/fonts-for-web.py`) and the
same world data (`Worlds.qml`, from which `worlds.gen.ts` is written).

## Principles

1. **A film's sky.** Every page stands on a still from an anime film under
   its world's grade, or the world's drawn sky when there is no still. Words
   on the still are white (the `--art-…` tokens).
2. **Glass.** Panels are glass: what is behind them blurred, a hairline,
   one corner cut at 45° (top right), the top edge and the cut catching the
   light. The page's lead panel wears brackets in the light; others light
   theirs under the pointer.
3. **Faces by role.** HUD capitals (Chakra Petch, tracked wide) for labels
   of one to three words; Outfit for reading; each world's title face for
   titles and every Japanese tag (Corporate Logo, Mercury's Yuji Syuku,
   Terra's and Luna's Keifont; Neptune's Makinas 4 is the apps' alone, so
   Neptune's pages here keep Corporate Logo); Corporate Logo Bold for
   subtitles and big figures. Japanese is never in capitals or tracked.
4. **One mood a world.** There is no day mode: each world keeps its
   flavour all day. Nothing is filled except the screen's main action.

## The flavours

A flavour is a world's palette and its ground (`Theme.yozoraLooks`): Saturn's
dusk (amber and cyan), Mercury's shrine at night (sakura, gold, vermilion
seals), Neptune's neon rain (red and ice cyan), Terra's noon (frosted white
glass with dark ink, ramune blue, a sunflower primary) and Luna's moonlit
evening (indigo, moon yellow). A moon without one wears its planet's.

An element wears a flavour with `data-flavour="<id>"`; everything inside it
takes that flavour's tokens (`--ground`, `--glass`, `--edge`, `--accent`,
`--second`, `--primary`, the `--text-…`, `--hud-…` and `--art-…` words, the
`--sky-0…4` and `--grade-0…4` stops). The Shell sets it from its `flavour`
(the app's world unless a page is about another). **Sol wears Saturn's
dusk**, as `Theme.yozoraOf` gives any world without one, and a world's own
page in Sol wears that world's flavour, the rail and every panel with it.
`flavourOf`, `jpOf` and `capsFor` (`look.ts`) are the rules a script needs.

## The ground

`<Ground>` (the Shell draws it) is the flavour's drawn sky (its five stops
top to bottom, stars at night, Terra's sun, Neptune's rain drawn once) and,
over it, a still the page may show, faded in, framed as the flavour frames
its stills, under the grade, a shade down the left where titles stand and a
vignette. The stills are the person's own pictures from the films and are
**never** part of this package or Sol's build: Sol serves its owner's
`sol-yozora` folder to them signed in (`/api/sol/look`), and the Shell takes
their addresses as `stills`, one per section in turn (`stillFor`, as the
apps do). Signed out, or without a folder, it is the drawn sky.

## The frame

Every app is a window, not a page. `<Shell>` draws the frame:

| Part | What it is | Rule |
| --- | --- | --- |
| Rail | Floating glass on the left: the world's kanji in a diamond, its name in Japanese over its name in HUD capitals, its sections, its doors, its status at the foot | 228 px; on a narrow window 60 px, each section its number and its Japanese. Its foot's corner is cut, brackets on its top corners. Chrome: not selectable |
| Sections | Numbered 01, 02 … with their `jp` before the name | The current one has a 3 px bar in the light, which glides to the next |
| Doors | Under the sections: Sol, and the moons or planet this world works with | Opening one opens that app |
| Status | The rail's foot: `LinkStatus` or the app's own | One line |
| Pane | The app's screens, on the ground | Scrolls on its own; the window and the chrome never scroll. Content is never wider than `--content` (1400 px) |

`Ctrl` (or `⌘`) + `1`…`9` jumps to a section, `/` opens the app's search
and `?` opens a sheet of the keys. Every section carries a `hint`: one line
on what it is for, shown on hover.

### Going back

A page whose path isn't a section's was opened from somewhere, and the
Shell offers the way back: always 「← 戻る」 BACK, the page it leads to in
its hint. The `PageHead` shows it first; a page without one gets it floating
over the pane's corner. Alt+← and the mouse's back button go back too, and
going back lands where the page was left.

## The title card

A first page opens with a `Sheet`: the title card on the still. A HUD line
(what is on, else the world and the day), the page's Japanese in the title
serif (`jp`, the world's name unless given), the English line under it
(`callout`), then what sits under it (moon links, the main action) beside
two or three `HeroFigure`s with their Japanese tags (`figures`). Never a
strip of "LABEL: VALUE" facts. In a pane under about 1070 px it is compact,
so the first card is in the first view.

Other pages start with a `PageHead`: a glass band that stays put, the
page's Japanese (`jp`, else its section's), its HUD line (the section's
number and the world) over the English title, a quiet line and the page's
actions.

## Components

| Component | Use |
| --- | --- |
| `Shell` | The frame of every app: the ground, the rail, the pane, an optional footer bar, notices |
| `Ground` | The ground on its own (a page outside a Shell: sign-in) |
| `Sheet`, `HeroFigure` | A first page's title card and its figures |
| `PageHead` | The top of every other page |
| `Card` | A group on glass, headed by a `HudLabel`; `lead` keeps its brackets on |
| `HudLabel` | A heading of the look: the flavour's mark (Saturn's diamond, Mercury's seal, Neptune's slashes or lit sign, Terra's furin), the words, the Japanese tag |
| `Button` | `primary` (a parallelogram in the light, once a screen), `ghost`, `quiet`, `round` (a diamond), `danger` (the slant outlined in vermilion: what can't be taken back) |
| `Field`, `Select`, `TextArea` | A HUD label over a bracketed well ([ ]) that lights with the keys |
| `Toggle`, `Check` | Square, filled in the light |
| `Progress`, `SlantTicks` | How far along, as slanted ticks |
| `DataRows` | Facts as a ledger: the label left, the value right, hairlines between |
| `MoonLink` | A diamond, a moon's Japanese name and its words, under a title |
| `Widget`, `Notices`, `Loader`, `WorldGlyph`, `Back` | A world's widget, notices on glass at the top right, waiting, a world's mark, the way back |

`Body`, `Reticle`, `Callout`, `RingGauge`, `AppUpdates`, `LinkStatus`,
`WayBack` and `WithPlanet` are left from the Observatory look and the Svelte
world apps.

Glass is `.sol-glass` (an element first inside a positioned panel with
`isolation: isolate`), brackets `.sol-brackets`, a field's well `.sol-well`,
focus `.sol-ticks`, labels `.sol-label`, `.sol-quiet` and `.sol-jp`.

## Motion

Things arrive; nothing moves for its own sake and nothing moves while the
page rests. Every length and curve is a token from `Theme.qml`: `--snap`
(a press), `--lock`, `--fade` (text and colour), `--settle` (taking a
place), `--turn` (a page arriving), `--count` (a figure counting up),
`--rise`, `--stagger` between siblings (never past 400 ms), and the curves
`--ease`, `--ease-out`, `--spring` (a tenth past its place and back) and
`--ease-in-out`. Cards settle with the spring, buttons give under a press
and spring back, figures count up on arrival, the rail's light glides.
Only opacity and transforms move. With less motion (`prefers-reduced-motion`)
only fades and instant changes are left, as the apps' `Theme.calm`.

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
2. The first screen is a `Sheet` with the world's title card and figures;
   a planet's shows its installed moons under the title, a moon's its planet.
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
    durations and curves in `Theme` are the only ones.

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
scripts/smoke.sh`), in each flavour (a world's page wears its own), and at the brand book (`npm run build`,
then serve `build/`; `?flavour=<id>` opens it in one flavour). The rest of this section is from when the worlds' apps
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
