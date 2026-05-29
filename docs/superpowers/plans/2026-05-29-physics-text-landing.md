# Physics-Text Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a one-shot animated landing page where the centered hero text flickers, shatters into individual letters that fall and pile on the floor with 2D physics, then is replaced by a new tagline — and archive the current root version into `lava/`.

**Architecture:** Three static files at repo root (`index.html`, `styles.css`, `script.js`), no build step, served by GitHub Pages. Letters are DOM `<span>`s driven by Matter.js rigid bodies for the fall/pile. Theme is CSS custom properties with a `data-theme` swap. The whole sequence plays once on load and rests.

**Tech Stack:** Vanilla HTML/CSS/JS, Matter.js (2D physics, via cdnjs), Titillium Web (Google Fonts).

**Note on verification:** This repo has no test runner and the deliverable is a visual/temporal animation. Each task is verified by serving the site locally (`python3 -m http.server 8000` from the repo root) and observing behavior in a browser. There are no unit tests to write.

---

## File structure

| File | Responsibility |
|------|----------------|
| `lava/index.html`, `lava/script.js`, `lava/styles.css` | Archived lava-lamp version (moved from root). |
| `index.html` | Document, fonts, Matter.js CDN, discrete top links, empty hero + reveal containers. |
| `styles.css` | Theme vars (light default + dark preset), stage layout, letter/flicker/reveal styling, reduced-motion fallback. |
| `script.js` | Copy + tuning constants, sequence orchestrator, flicker, shatter→physics, reveal, reduced-motion branch. |
| `docs/superpowers/specs/2026-05-29-physics-text-landing-design.md` | The approved design (already committed). |

---

### Task 1: Archive the current root version into `lava/`

The current *untracked* root files are the lava-lamp version. Move them into `lava/`.

**Files:**
- Move: `index.html` → `lava/index.html`
- Move: `script.js` → `lava/script.js`
- Move: `styles.css` → `lava/styles.css`

- [ ] **Step 1: Confirm the untracked root files are the lava version**

Run: `git status --short && head -40 index.html | grep -c goo`
Expected: `index.html`, `script.js`, `styles.css` listed as untracked (`??`), and the grep prints a non-zero count (the lava `#goo` filter is present).

- [ ] **Step 2: Create the folder and move the three files**

```bash
mkdir -p lava
mv index.html lava/index.html
mv script.js lava/script.js
mv styles.css lava/styles.css
```

- [ ] **Step 3: Verify the archived page loads**

```bash
python3 -m http.server 8000 >/dev/null 2>&1 &
SERVER_PID=$!
sleep 1
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/lava/
kill $SERVER_PID
```
Expected: `200`. (Optionally open `http://localhost:8000/lava/` in a browser and confirm the lava-lamp blobs still animate.)

- [ ] **Step 4: Commit**

```bash
git add lava/
git commit -m "chore: archive lava-lamp version into lava/"
```

---

### Task 2: Create the new root `index.html`

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write the full document**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Dennis Komac — fullstack engineer." />
    <title>Dennis Komac</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700;900&display=swap"
      rel="stylesheet"
    />
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <!-- discrete links, top corner, present the whole time -->
    <nav class="links" aria-label="Profile links">
      <a class="contact-link" href="https://www.linkedin.com/in/dennis-komac-b5285381/" rel="me noopener" target="_blank" aria-label="LinkedIn" title="LinkedIn">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6.94 8.72H3.86v10.17h3.08V8.72ZM7.16 5.58c0-.96-.72-1.69-1.78-1.69s-1.78.73-1.78 1.69c0 .94.7 1.68 1.74 1.68h.02c1.08 0 1.8-.74 1.8-1.68ZM20.4 13.06c0-3.12-1.66-4.57-3.88-4.57-1.79 0-2.59.98-3.04 1.67V8.72h-3.08c.04.96 0 10.17 0 10.17h3.08v-5.68c0-.3.02-.61.11-.83.24-.61.78-1.24 1.69-1.24 1.19 0 1.67.93 1.67 2.29v5.46h3.08l.37-5.83Z" /></svg>
        <span class="sr-only">LinkedIn</span>
      </a>
      <a class="contact-link" href="https://github.com/dkomac" rel="me noopener" target="_blank" aria-label="GitHub" title="GitHub">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2.25c-5.38 0-9.75 4.37-9.75 9.75 0 4.3 2.79 7.95 6.66 9.24.49.09.67-.21.67-.47v-1.81c-2.71.59-3.28-1.16-3.28-1.16-.44-1.12-1.08-1.42-1.08-1.42-.89-.61.07-.6.07-.6.98.07 1.5 1.01 1.5 1.01.87 1.49 2.29 1.06 2.85.81.09-.63.34-1.06.62-1.31-2.16-.25-4.44-1.08-4.44-4.81 0-1.06.38-1.93 1.01-2.61-.1-.25-.44-1.24.1-2.58 0 0 .82-.26 2.68 1 .78-.22 1.61-.33 2.44-.33.83 0 1.66.11 2.44.33 1.86-1.26 2.68-1 2.68-1 .54 1.34.2 2.33.1 2.58.63.68 1.01 1.55 1.01 2.61 0 3.74-2.28 4.56-4.45 4.8.35.3.66.9.66 1.82v2.7c0 .26.18.57.67.47A9.76 9.76 0 0 0 21.75 12c0-5.38-4.37-9.75-9.75-9.75Z" /></svg>
        <span class="sr-only">GitHub</span>
      </a>
      <a class="contact-link" href="mailto:komac91@msn.com" aria-label="Email" title="Email">
        <svg class="icon-stroke" aria-hidden="true" viewBox="0 0 24 24"><path d="M4.75 6.75h14.5v10.5H4.75V6.75Z" /><path d="m5.25 7.25 6.75 5.5 6.75-5.5" /><path d="m8.75 11.5-3.5 5.25M15.25 11.5l3.5 5.25" /></svg>
        <span class="sr-only">Email</span>
      </a>
    </nav>

    <main class="stage">
      <!-- hero is built from per-letter spans by script.js -->
      <h1 class="hero" data-hero aria-label="dennis komac. let's build something. or break things. whatever floats your boat."></h1>
      <!-- the line that rises after the collapse -->
      <p class="reveal" data-reveal aria-hidden="true">or break things. whatever floats your boat.</p>
    </main>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
    <script src="script.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify the markup serves and the links are correct**

```bash
python3 -m http.server 8000 >/dev/null 2>&1 &
SERVER_PID=$!
sleep 1
curl -s http://localhost:8000/ | grep -c "data-hero"
curl -s http://localhost:8000/ | grep -c "linkedin.com/in/dennis-komac"
kill $SERVER_PID
```
Expected: each grep prints `1`. (`styles.css`/`script.js` don't exist yet — that's fine; this only checks the HTML.)

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add root index.html for physics-text landing"
```

---

### Task 3: Create `styles.css`

**Files:**
- Create: `styles.css`

- [ ] **Step 1: Write the full stylesheet**

```css
:root {
  color-scheme: light;
  /* ===== THEME — light (default). Swap with <html data-theme="dark">. ===== */
  --bg: #ffffff;
  --text: #0a0a0a;
  --accent: #0a0a0a;          /* link icons */
  --accent-hover: #666666;
  --flicker-color: #0a0a0a;   /* color flashed mid-flicker */
}

html[data-theme="dark"] {
  color-scheme: dark;
  --bg: #050505;
  --text: #f3f3f3;
  --accent: #d0d0d0;
  --accent-hover: #ffffff;
  --flicker-color: #66ccff;   /* neon-ish flash */
}

* { box-sizing: border-box; }

html { height: 100%; background: var(--bg); }

body {
  height: 100vh;
  margin: 0;
  overflow: hidden;            /* falling letters must not scroll the page */
  background: var(--bg);
  color: var(--text);
  font-family: "Titillium Web", ui-sans-serif, system-ui, -apple-system, sans-serif;
}

/* discrete links, top-right */
.links {
  position: fixed;
  top: clamp(1rem, 3vw, 2rem);
  right: clamp(1rem, 3vw, 2rem);
  z-index: 10;
  display: flex;
  gap: 0.9rem;
}
.contact-link {
  display: inline-flex;
  width: 22px;
  height: 22px;
  color: var(--accent);
  transition: color 0.2s ease, transform 0.2s ease;
}
.contact-link:hover { color: var(--accent-hover); transform: translateY(-2px); }
.contact-link svg { width: 100%; height: 100%; fill: currentColor; }
.contact-link .icon-stroke {
  fill: none; stroke: currentColor; stroke-width: 1.6;
  stroke-linecap: round; stroke-linejoin: round;
}
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

/* stage */
.stage {
  position: relative;
  height: 100vh;
  display: grid;
  place-content: center;
  text-align: center;
  padding: 1.5rem;
}

.hero {
  margin: 0;
  font-weight: 300;
  font-size: clamp(1.6rem, 7.5vw, 4.75rem);
  line-height: 1.05;
  letter-spacing: -0.01em;
  max-width: 92vw;
  opacity: 0;
  transition: opacity 0.7s ease;
}
.hero.entered { opacity: 1; }

.hero .line { display: block; }

.hero .letter {
  display: inline-block;       /* required so per-glyph transforms apply */
  will-change: transform, opacity;
}

/* a glyph promoted to a physics body floats above the layout */
.hero .letter.physics {
  position: fixed;
  margin: 0;
  transform-origin: center center;
  z-index: 5;
}

/* flicker — dying-sign stutter */
@keyframes flicker {
  0%, 100% { opacity: 1; }
  10% { opacity: 0.2; }
  12% { opacity: 1; }
  20% { opacity: 0.45; color: var(--flicker-color); }
  22% { opacity: 1; color: inherit; }
  55% { opacity: 0.12; }
  57% { opacity: 1; }
  70% { opacity: 0.6; color: var(--flicker-color); }
  72% { opacity: 1; color: inherit; }
}
.hero .letter.flicker { animation: flicker 0.55s steps(2, end) infinite; }

/* reveal — the line that rises into the empty center */
.reveal {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, calc(-50% + 26px));
  margin: 0;
  width: min(92vw, 42rem);
  text-align: center;
  font-weight: 300;
  font-size: clamp(1.4rem, 5.5vw, 3.25rem);
  line-height: 1.12;
  letter-spacing: -0.01em;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.9s ease, transform 0.9s ease;
}
.reveal.show {
  opacity: 1;
  transform: translate(-50%, -50%);
}

/* reduced motion: calm static final state, no flicker or physics */
@media (prefers-reduced-motion: reduce) {
  .hero, .hero.entered { opacity: 1; transition: none; }
  .hero .letter.flicker { animation: none; }
  .reveal { transition: none; }
}
```

- [ ] **Step 2: Verify it serves**

```bash
python3 -m http.server 8000 >/dev/null 2>&1 &
SERVER_PID=$!
sleep 1
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/styles.css
kill $SERVER_PID
```
Expected: `200`.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: add styles for physics-text landing (themeable)"
```

---

### Task 4: Create `script.js` (full sequence logic)

This file owns the whole sequence. It is written complete in one task because the beats (enter → flicker → shatter → reveal) only make sense as one orchestrated timeline; verification of each beat happens in Task 5.

**Files:**
- Create: `script.js`

- [ ] **Step 1: Write the full script**

```js
/* ============================================================
   Physics-text landing — flicker, shatter & pile, reveal.
   Plays once on load, then rests. Theme via <html data-theme>.
   ============================================================ */

/* ---- copy (edit here) ---- */
const COPY = {
  line1: "dennis komac",
  line2: "let's build something.",
  final: "or break things. whatever floats your boat.",
};

/* ---- tuning (edit the feel here) ---- */
const CFG = {
  enterDelay: 350,        // ms after load before text fades in
  flickerDelay: 900,      // ms text stays calm before flicker starts
  flickerDuration: 1100,  // ms of flicker before the collapse
  settleTime: 2200,       // ms to let letters fall/pile before the reveal
  gravity: 1,             // Matter world gravity (y)
  restitution: 0.28,      // letter bounciness
  friction: 0.55,         // letter surface friction
  frictionAir: 0.01,
  floorThickness: 200,    // px (mostly below the viewport)
  spinFactor: 0.18,       // initial angular velocity spread
  kickFactor: 2.2,        // initial sideways velocity spread
  maxFrames: 900,         // physics loop safety cap (~15s at 60fps)
};

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const heroEl = document.querySelector("[data-hero]");
const revealEl = document.querySelector("[data-reveal]");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* deterministic per-index pseudo-random in [-1, 1] (no Math.random) */
function jitter(i) {
  const x = Math.sin((i + 1) * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/* Build the hero from per-glyph spans grouped into lines.
   Spaces are breakable text nodes (not bodies). Returns glyph spans. */
function buildLetters(lines) {
  heroEl.replaceChildren();
  const glyphs = [];
  lines.forEach((text) => {
    const line = document.createElement("span");
    line.className = "line";
    for (const ch of text) {
      if (ch === " ") {
        line.append(document.createTextNode(" "));
        continue;
      }
      const span = document.createElement("span");
      span.className = "letter";
      span.textContent = ch;
      line.append(span);
      glyphs.push(span);
    }
    heroEl.append(line);
  });
  return glyphs;
}

/* Beat 2: flicker the whole second line + an index-derived subset of line 1. */
function startFlicker(glyphs, line2Start) {
  glyphs.forEach((span, i) => {
    const picked = i >= line2Start || i % 4 === 0;
    if (!picked) return;
    span.style.animationDelay = `${(jitter(i) * 0.25).toFixed(3)}s`;
    span.classList.add("flicker");
  });
}

/* Beat 3: convert every glyph into a Matter body and run gravity.
   Glyphs pin to their measured spot (position: fixed), then transform
   each frame from the body's position + angle so they tumble and pile. */
function shatter(glyphs) {
  const { Engine, Bodies, Composite, Body } = Matter;
  const engine = Engine.create();
  engine.gravity.y = CFG.gravity;
  engine.enableSleeping = true;

  const W = window.innerWidth;
  const H = window.innerHeight;

  const floor = Bodies.rectangle(
    W / 2, H + CFG.floorThickness / 2 - 8, W * 2, CFG.floorThickness,
    { isStatic: true },
  );
  const leftWall = Bodies.rectangle(-30, H / 2, 60, H * 3, { isStatic: true });
  const rightWall = Bodies.rectangle(W + 30, H / 2, 60, H * 3, { isStatic: true });
  Composite.add(engine.world, [floor, leftWall, rightWall]);

  const items = [];
  glyphs.forEach((span, i) => {
    const rect = span.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    span.classList.add("physics");
    span.style.left = `${rect.left}px`;
    span.style.top = `${rect.top}px`;
    span.style.width = `${rect.width}px`;
    span.style.height = `${rect.height}px`;

    const body = Bodies.rectangle(cx, cy, rect.width, rect.height, {
      restitution: CFG.restitution,
      friction: CFG.friction,
      frictionAir: CFG.frictionAir,
    });
    Body.setAngularVelocity(body, jitter(i) * CFG.spinFactor);
    Body.setVelocity(body, {
      x: jitter(i * 7) * CFG.kickFactor,
      y: -Math.abs(jitter(i * 3)) * 1.5,
    });
    Composite.add(engine.world, body);
    items.push({ span, body, cx, cy });
  });

  let frames = 0;
  const step = () => {
    Engine.update(engine, 1000 / 60);
    for (const it of items) {
      const dx = it.body.position.x - it.cx;
      const dy = it.body.position.y - it.cy;
      it.span.style.transform =
        `translate(${dx}px, ${dy}px) rotate(${it.body.angle}rad)`;
    }
    frames += 1;
    const allAsleep = items.length > 0 && items.every((it) => it.body.isSleeping);
    if (allAsleep || frames > CFG.maxFrames) return; // rest
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* Beat 4: raise the final line into the now-empty center. */
function reveal() {
  revealEl.classList.add("show");
}

/* Full sequence — plays once. */
async function runSequence() {
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (_) { /* ignore */ }
  }

  const glyphs = buildLetters([COPY.line1, COPY.line2]);
  const line2Start = [...COPY.line1].filter((c) => c !== " ").length;

  await wait(CFG.enterDelay);
  heroEl.classList.add("entered");

  await wait(CFG.flickerDelay);
  startFlicker(glyphs, line2Start);

  await wait(CFG.flickerDuration);
  glyphs.forEach((s) => s.classList.remove("flicker"));
  shatter(glyphs);

  await wait(CFG.settleTime);
  reveal();
}

/* Reduced motion: calm static final state — name + final line, no physics. */
function reducedMotionState() {
  heroEl.replaceChildren();
  for (const text of [COPY.line1, COPY.final]) {
    const line = document.createElement("span");
    line.className = "line";
    line.textContent = text;
    heroEl.append(line);
  }
  heroEl.classList.add("entered");
}

if (prefersReducedMotion) {
  reducedMotionState();
} else {
  window.addEventListener("load", runSequence, { once: true });
}
```

- [ ] **Step 2: Verify it serves and parses (no syntax errors)**

```bash
node --check script.js && echo "SYNTAX OK"
python3 -m http.server 8000 >/dev/null 2>&1 &
SERVER_PID=$!
sleep 1
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/script.js
kill $SERVER_PID
```
Expected: `SYNTAX OK` then `200`.

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: add physics-text sequence (flicker, shatter, reveal)"
```

---

### Task 5: Verify the full sequence in a browser (light theme)

**Files:** none (verification only).

- [ ] **Step 1: Serve the site**

```bash
python3 -m http.server 8000
```

- [ ] **Step 2: Open and watch the sequence**

Open `http://localhost:8000/` in a browser. Observe, in order:
1. `dennis komac` + `let's build something.` fade in, centered.
2. Letters flicker like a dying sign (~1s) — the second line plus scattered first-line glyphs.
3. Every letter detaches, falls, tumbles, and piles along the bottom edge, contained by the side walls (nothing escapes off-screen).
4. `or break things. whatever floats your boat.` rises/fades into the center.
5. Everything rests; the letter-pile stays on the floor.

Open DevTools Console and confirm **no errors** (e.g. `Matter is not defined` would mean the CDN failed to load).

- [ ] **Step 3: If anything is off, tune and re-verify**

Adjust `CFG` in `script.js`:
- Letters scatter too flat / don't pile → raise `CFG.friction` (e.g. `0.7`) or lower `CFG.restitution` (e.g. `0.15`).
- Fall too slow/fast → adjust `CFG.gravity`.
- Flicker too short/long → adjust `CFG.flickerDuration`.
- Reveal appears before letters settle → raise `CFG.settleTime`.

Re-open the page after each change. Commit only if you changed `script.js`:

```bash
git add script.js
git commit -m "tune: adjust physics-text timing/feel"
```

---

### Task 6: Verify the dark-glitch theme swap

**Files:** none (verification only).

- [ ] **Step 1: Serve and apply the dark theme at runtime**

With the server running, open `http://localhost:8000/`, then in the DevTools Console run:

```js
document.documentElement.setAttribute("data-theme", "dark");
location.reload();
```

(CSS custom properties re-theme instantly; reloading replays the sequence on the dark stage.)

- [ ] **Step 2: Confirm**

Expected: black background, light text, neon-blue flicker flashes. Links and the full sequence render correctly with no layout breakage. Console shows no errors.

(No commit — this only confirms the preset already shipped in `styles.css` works.)

---

### Task 7: Verify reduced-motion and finish

**Files:** none unless a fix is needed.

- [ ] **Step 1: Emulate reduced motion**

In DevTools: open the Command Menu (Cmd/Ctrl+Shift+P) → run **"Emulate CSS prefers-reduced-motion: reduce"** → reload `http://localhost:8000/`.

- [ ] **Step 2: Confirm the static fallback**

Expected: no flicker, no falling letters. The page shows `dennis komac` and `or break things. whatever floats your boat.` centered and static, with the discrete links at the top. Console shows no errors.

- [ ] **Step 3: Responsive check**

Toggle the device toolbar (Cmd/Ctrl+Shift+M). Confirm at ~360px width and at a wide desktop width: hero text fits without clipping, letters pile within the viewport, and the reveal line wraps cleanly.

- [ ] **Step 4: Final confirmation commit (if any fixes were made)**

```bash
git add -A
git commit -m "fix: reduced-motion / responsive polish for physics-text landing"
```

If no fixes were needed, there is nothing to commit — the feature is complete.

---

## Self-Review notes (for the implementer)

- **Spec coverage:** file moves (Task 1), sequence beats enter/flicker/shatter/reveal (Tasks 2–5), Matter.js choice (Task 4), discrete top links (Task 2), light default + dark preset (Tasks 3, 6), all-lowercase copy & pile-only final state (Task 4 `COPY` + no wordmark), reduced-motion fallback (Tasks 3, 7), one-shot/no-replay (Task 4 — `load` listener with `{ once: true }`, no loop).
- **Naming consistency:** `buildLetters` returns glyph spans used by `startFlicker`, `shatter`; `COPY`/`CFG` constants referenced consistently; `data-hero`/`data-reveal` match the HTML in Task 2.
- **No placeholders:** every code step is complete and runnable.
