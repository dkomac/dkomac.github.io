# Physics-Text Landing Page — Design

**Date:** 2026-05-29
**Status:** Approved (pending spec review)

## Summary

A new root version of `dkomac.github.io`: a one-shot animated landing page where
the centered hero text flickers like a dying sign, shatters into individual
letters that fall and pile on the floor with real 2D physics, and is replaced by a
new tagline that rises in its place. The page then rests in that final state.

This is the third in a series of versions. The two prior versions are archived in
folders; this one takes the repo root.

## Version layout / file moves

The repo keeps one "live" version at root and archives older ones in named folders.

- `rain/` — existing three.js rain-scene version (already archived; staged in git).
- `lava/` — **new archive folder.** The current *untracked* root files
  (`index.html`, `script.js`, `styles.css` — the lava-lamp goo version) move here.
- root `index.html` / `script.js` / `styles.css` — **brand new**, this design.

Same 3-file static structure as the other versions (GitHub Pages, no build step).

## The sequence (plays once on load, then rests)

| # | Beat | Behavior |
|---|------|----------|
| 0 | Links | Discrete LinkedIn / GitHub / email icon links sit small in a top corner. Present the entire time, including final state. |
| 1 | Enter | Centered: `dennis komac` (line 1) + `let's build something.` (line 2) fade in. |
| 2 | Flicker | *Some* of the text stutters like a dying neon/CRT sign — an index-derived subset of letters plus the tagline — building instability for ~1s. |
| 3 | Collapse | Every letter detaches and becomes a rigid physics body (gravity, spin, collisions). Letters tumble and **pile on the floor** against the side walls. The name survives only as this rubble. |
| 4 | Reveal | `or break things. whatever floats your boat.` rises / fades into the now-empty center. |
| 5 | Rest | Stays there. The letter-pile remains on the floor. No replay. |

## Decisions (from brainstorming)

- **Drop granularity:** letters shatter & pile (individual glyphs, not word-blocks).
- **What falls:** the entire centered block (both name and tagline).
- **Replay:** play once on load, settle, stay. No loop, no click-to-replay.
- **Final-state name:** pile only (artful) — the name lives on as the physical
  rubble plus the discrete top links. No readable wordmark added.
- **Default theme:** light / on-brand (white bg, black text, Titillium Web).
  Dark-glitch preset also shipped, swappable.
- **Copy casing:** all lowercase, cohesive with existing pages.

## Copy (single editable constant)

```
line 1:  dennis komac
line 2:  let's build something.
final:   or break things. whatever floats your boat.
```

## Architecture

Three files, no build step:

- **index.html** — document, Google Fonts (Titillium Web), discrete top links
  (reuse the LinkedIn/GitHub/email SVGs from `rain/index.html`), a stage container
  for the hero text, and a `<script>` CDN tag for the physics engine + `script.js`.
- **styles.css** — theme custom properties in `:root`, `data-theme` presets, stage
  layout, letter/flicker styling, reveal styling, reduced-motion fallback.
- **script.js** — tuning constants, the timeline orchestrator, the flicker effect,
  the shatter→physics handoff, the reveal, and the reduced-motion branch.

### Physics approach — Matter.js (chosen)

Use **Matter.js** (lightweight 2D physics) loaded from a CDN, consistent with how
`rain/` loads three.js from a CDN.

- Each letter is a DOM `<span>` whose transform (position + rotation) is driven by a
  Matter rigid body every animation frame. Text stays selectable, accessible, and
  CSS-themeable; ~30 bodies is trivial for perf.
- A static floor body sits near the bottom; static walls at the left/right viewport
  edges contain the pile.
- Letters get gravity, slight random angular velocity at release (varied per letter
  by index so the scatter differs without `Math.random` being required), restitution
  (bounce) and friction tuned to pile rather than scatter flat.

**Alternatives considered and rejected:**
- *Hand-rolled gravity:* zero deps but no real collision solver → fake/overlapping
  piles. Rejected.
- *Matter.js + canvas glyph rendering:* fastest for huge body counts but loses text
  accessibility and adds glyph-render code. Overkill for ~30 letters. Rejected.

### Component boundaries (in `script.js`)

- **Config block** — all tuning in one place: gravity, restitution, friction,
  flicker duration/intensity, enter/reveal timings, floor offset. Editing the feel
  should never require touching logic.
- **buildLetters(text, container)** — splits the hero lines into positioned
  `<span>` glyphs; returns their DOM refs and measured rects. One job: DOM + measure.
- **startFlicker(spans, opts)** — applies the stutter to a subset of spans for a
  fixed duration; resolves when done. One job: the flicker beat.
- **shatter(spans)** — creates a Matter body per span from its measured rect, adds
  floor/walls, starts the render-sync loop. One job: physics handoff + run.
- **reveal(text, container)** — fades/raises the final line into the center.
- **runSequence()** — the orchestrator that awaits each beat in order.
- **reducedMotionState()** — renders the final static layout, no physics.

### Theming

- `:root` defines: `--bg`, `--text`, `--accent`, `--flicker-color`, `--floor` (and
  any letter/pile color). Light is the default.
- `html[data-theme="dark"]` overrides those vars for the dark-glitch preset.
- Swap looks by changing one attribute on `<html>`. Presets are documented at the
  top of `styles.css` so new looks are easy to add.

## Edge cases & non-goals

- **Reduced motion** (`prefers-reduced-motion: reduce`): skip flicker + physics
  entirely; render the final state directly — `dennis komac` + the final tagline
  centered and static, links at top.
- **Resize:** the sequence is one-shot. Build floor/walls for the viewport at load.
  After the pile settles, a resize is not re-simulated (acceptable for a one-shot
  rest state); only re-fit the centered reveal text via normal CSS centering.
- **Determinism:** scatter variation comes from per-letter index, not `Math.random`,
  so the effect is reproducible (and avoids reliance on RNG).
- **Non-goals:** no project list, no routing, no loop/replay UI, no backend.

## Testing / verification

Static page — verified by running it in a browser:

- Sequence plays correctly: enter → flicker → shatter/pile → reveal → rest.
- Letters land and pile against the floor and walls without escaping the viewport.
- `data-theme="dark"` swaps the look with no layout breakage.
- `prefers-reduced-motion` shows the static final state with no motion.
- Discrete top links are present and click through to the correct URLs.
- Responsive: text and floor track small / large viewports.
