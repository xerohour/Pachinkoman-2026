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
- **De-minified the engine.** `game.js` is the full beautified source (~3,200 lines,
  readable formatting) instead of a 79 KB single-line blob. No separate source map
  needed — the shipped file *is* the source.
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
- `index.html` modernized: doctype, `charset`, `viewport`, `lang`, dead press-kit
  link removed, fatal-error `role="alert"` region.

## Still on the roadmap

- Split the engine into ES modules (`input`, `dialogue`, `level`, `save`, `audio`…)
  instead of one 3,200-line file
- Full `var` → `const`/`let` and arrow-function modernization pass
- Build pipeline (Vite), ESLint + Prettier, `npm run dev` with hot reload
- High-contrast / text-only mode, remappable keys

## Run locally

Any static server works, e.g. `npx serve .` or `python3 -m http.server`,
then open http://localhost:3000 (or :8000).
