# Pachinkoman-2026

A cleaned-up, dependency-free rebuild of **Pachinko Man**, the surreal point-and-click
adventure by [Punch The Moon](http://punchthemoon.com). Play it here:

**https://xerohour.github.io/Pachinkoman-2026/**

This repo starts from a full clone of the original game
(`xerohour/pachinkoman`) and applies the improvement roadmap below.

## Credits (original game)

- **PUNCH THE MOON** — [Clayton Chowaniec](http://twitter.com/clayzulah) (Programming / Writing / Story / Design),
  [Alexander Swenson](http://bfjobdog.com) (Art / Story / Design),
  Weird BIAS (Music / Sound), Afal (Programming)
- Sound effects: Lightning by Greg Evans and Glass Break by Mike Koenig (CC Attribution 3.0)

## What was improved

### P0 — Readability & dependencies
- **De-minified the engine, then split it into ES modules.** The original
  79 KB single-line blob is now 13 readable modules under `js/` (`input`,
  `dialogue`, `level`, `save`, `audio`, `graphics`, `logic`, `action`,
  `resources`, `player`, `dimmer`, `util`, `main`) — no separate source map
  needed, the shipped files *are* the source. `index.html` loads
  `js/main.js` as a module.
- **`var` → `const`/`let` modernization pass.** A conservative scope-aware
  transform converted ~200 declarations to `const`/`let` (the remaining
  ~90 stay `var` where hoisting, capture, or TDZ semantics made conversion
  unsafe). Verified by a differential boot test: pre- and post-transform
  builds driven through logo → title → menu → new game → intro dialogue
  produced byte-identical render traces over 806 frames.
- **jQuery removed.** The 2014-era jQuery 1.11.1 bundle (~96 KB) is gone. All
  `$(...)`, `$.each`, `$.extend`, `$.getJSON` uses were replaced with vanilla
  DOM, `addEventListener`, `fetch`, `forEach`/`Object.keys`, and
  `structuredClone` (with a JSON fallback).

### P1 — Robustness
- **Saves moved from cookies to `localStorage`.** Cookies were sent with every
  HTTP request and capped at ~4 KB. Saves now live in `localStorage` under
  `pachinkoman_save` / `pachinkoman_settings`; any legacy cookie is imported
  once and then deleted. The game's light obfuscation of save data is preserved
  for compatibility.
- **Level loads can no longer hang silently.** The original used `$.getJSON`
  with no error handler, so a missing `levels/*.json` left the game stuck on a
  black screen forever (this exact bug bit the first clone). Loads now use
  `fetch`, and failures show a visible error banner instead of hanging.
- **Broken images can't stall loading either.** Image `onerror` now counts the
  loader down and logs the failure instead of hanging at "Loading... %".
  (The original audio loader contained dead code — `onplaythrough` isn't a real
  event — so audio now loads explicitly in the background without blocking.)
- **Corrupt saves are logged**, not silently swallowed: `SaveManager` catches
  now report to the console.

### P2 — Performance & modern web
- **Game loop uses `requestAnimationFrame`** with a fixed-timestep accumulator,
  keeping the original 50 Hz logic rate while syncing to the display and pausing
  cleanly in background tabs (instead of a raw `setInterval`).
- **Google Analytics snippet removed** (privacy; it also did nothing useful here).

### P3 — Accessibility & markup
- Canvas has `role="application"`, an `aria-label` describing the controls, and
  `tabindex="0"`.
- **High-contrast mode** (Options → High Contrast): dialogue panels render as
  black with white/yellow text. Persists in settings.
- **Remappable keys** (Options → Remap Keys): rebind Up/Down/Left/Right/OK to
  any keys, sequentially captured (Esc cancels). Persists in settings; the
  movement option label reports `Arrow Keys`, `WASD`, or `Custom`.
- `index.html` modernized: doctype, `charset`, `viewport`, `lang`, dead press-kit
  link removed, fatal-error `role="alert"` region.

### Phones & touch
- **Tap = left-click**: tap the canvas to interact, talk, advance dialogue.
- **D-pad** (bottom-left, touch devices only): four discrete direction buttons
  replacing the old analog stick. Each tap drives exactly one press frame
  (one menu step, no auto-repeat); holding a direction still walks until
  release, like a held arrow key. It drives the same arrow-key button states
  as the keyboard, so all movement and menu logic works unchanged.
- **OK action button** (bottom-right, touch devices only) acts as the
  spacebar: advances dialogue and confirms menu choices.
- **Haptic feedback**: light vibration on D-pad and OK presses (Android).
- **Screen stays awake** while playing via Wake Lock (re-acquired when the
  tab becomes visible again).
- **Canvas fits your screen** — scales down to the phone's width (aspect
  preserved, crisp pixelated rendering) instead of the original fixed
  600px, which was cut off on phones. All pointer math scales with it, so
  taps land correctly at any size.
- `touch-action: none` + `overscroll-behavior: none` + `preventDefault` stop
  pull-to-refresh, double-tap zoom, and synthetic mouse events from
  interfering; multi-touch works (D-pad + canvas tap simultaneously).
- Mobile web-app metadata (`mobile-web-app-capable`, black theme color) for
  a cleaner add-to-homescreen experience.
- The about panel stacks vertically under 620 px, and the bundled
  `pixelmix.ttf` font is now served locally (the original hot-linked it over
  plain `http`, which modern browsers block).

## Still on the roadmap

- Build pipeline (Vite), ESLint + Prettier, `npm run dev` with hot reload
- Arrow-function modernization pass (remaining `function` expressions)
- Text-only mode

## Run locally

Any static server works, e.g. `npx serve .` or `python3 -m http.server`,
then open http://localhost:3000 (or :8000).
