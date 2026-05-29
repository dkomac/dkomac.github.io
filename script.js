/* ============================================================
   Physics-text landing — glitch, shatter & pile, reveal.
   The name fades in; one or two characters glitch — tearing into
   offset horizontal slices (a datamosh look) — then every glyph
   drops straight down from its place and piles on the floor; a
   final line reveals. Plays once on load. Theme via <html data-theme>.
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
  glitchDelay: 900,       // ms the name stays readable before the glitch
  glitchDuration: 1100,   // ms of glitching before the collapse
  glitchTick: 90,         // ms between glitch frames (torn ⇄ clean)
  glitchCount: 2,         // how many characters glitch (just one or two)
  sliceBands: 4,          // horizontal slices a glitched letter tears into
  sliceMax: 9,            // px — max sideways jolt of a slice
  settleTime: 3200,       // ms after the collapse starts before the reveal
  gravity: 1,             // Matter world gravity (y)
  restitution: 0.18,      // letter bounciness (lower = less scatter on impact)
  friction: 0.6,          // letter surface friction
  frictionAir: 0.01,
  floorThickness: 200,    // px (mostly below the viewport)
  spinFactor: 0.03,       // initial angular velocity (gentle tumble on landing)
  kickFactor: 0,          // sideways velocity at release — 0 = falls straight down from place
  releaseBatch: 2,        // how many letters drop per step (a couple at a time)
  releaseInterval: 95,    // ms between each batch dropping — the cascade pacing
  maxFrames: 1400,        // physics loop safety cap (frames)
};

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const heroEl = document.querySelector("[data-hero]");
const revealEl = document.querySelector("[data-reveal]");

// COPY is the single source of truth — keep the accessible name in sync with it.
heroEl.setAttribute("aria-label", `${COPY.line1}. ${COPY.line2} ${COPY.final}`);

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

/* Pick a few distinct glyph indices (deterministic, scattered via jitter). */
function pickGlitchIndices(total, count) {
  const picks = [];
  let i = 0;
  while (picks.length < Math.min(count, total) && i < total * 8) {
    const k = Math.floor((jitter(i * 5 + 3) * 0.5 + 0.5) * total) % total;
    if (!picks.includes(k)) picks.push(k);
    i += 1;
  }
  return picks;
}

/* Beat 2: glitch one or two characters with a "datamosh" slice effect. The
   real letter stays untouched in the layout (so nothing moves); on a torn
   frame it's hidden and a stack of clipped copies — each a horizontal band of
   the same glyph, jolted sideways — is painted on top, so the letter looks
   torn into offset fragments. Frames alternate torn/clean for a broken-signal
   flicker. Returns { id, picks, bands } so the caller can stop and clean up. */
function startGlitch(glyphs) {
  const picks = pickGlitchIndices(glyphs.length, CFG.glitchCount).map((k) => glyphs[k]);
  const bands = picks.map((span) => {
    span.style.position = "relative";   // anchor for the slices; no offset = no move
    const slices = [];
    for (let b = 0; b < CFG.sliceBands; b += 1) {
      const slice = document.createElement("span");
      slice.className = "slice";
      slice.textContent = span.textContent;
      slice.setAttribute("aria-hidden", "true");
      const top = (b / CFG.sliceBands) * 100;
      const bottom = 100 - ((b + 1) / CFG.sliceBands) * 100;
      slice.style.clipPath = `inset(${top}% 0 ${bottom}% 0)`;
      slice.style.visibility = "hidden";
      span.append(slice);
      slices.push(slice);
    }
    return slices;
  });
  let tick = 0;
  const id = setInterval(() => {
    tick += 1;
    const torn = tick % 2 === 0;
    picks.forEach((span, j) => {
      const slices = bands[j];
      if (torn) {
        span.style.color = "transparent";
        slices.forEach((slice, b) => {
          const off = jitter(tick * 3 + b * 5 + j * 11) * CFG.sliceMax;
          slice.style.transform = `translateX(${off.toFixed(1)}px)`;
          slice.style.visibility = "visible";
        });
      } else {
        span.style.color = "";
        slices.forEach((slice) => { slice.style.visibility = "hidden"; });
      }
    });
  }, CFG.glitchTick);
  return { id, picks, bands };
}

/* Stop the glitch: remove the slice copies and restore the real letters. */
function stopGlitch(glitch) {
  clearInterval(glitch.id);
  glitch.bands.forEach((slices) => slices.forEach((slice) => slice.remove()));
  glitch.picks.forEach((span) => {
    span.style.removeProperty("position");
    span.style.removeProperty("color");
  });
}

/* Beat 3: convert each glyph into a Matter body. Bodies are prepared up
   front (glyphs pinned in place), then released a couple at a time in
   reading order so the text drops in a cascade rather than all at once.
   Released letters fall under gravity and pile on the floor; each frame
   their span transform tracks its body's position + angle. */
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

  // Measure every glyph's center while the whole text is still in normal flow.
  const measured = glyphs
    .map((span) => ({ span, rect: span.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width >= 1 && rect.height >= 1);

  // Build a physics body per glyph at its measured center. Crucially the glyph
  // STAYS in normal flow — we never set position/top/left, which would
  // re-anchor it (inline-block blockifies to block under position:fixed) and
  // make it jump. We only ever apply a transform, which starts at
  // translate(0,0): the letter sits exactly where it rendered and animates
  // from there, while un-dropped letters keep their place (transforms don't
  // reflow). Bodies are held out of the world until released, for the cascade.
  const pending = measured.map(({ span, rect }, i) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    span.classList.add("physics");

    const body = Bodies.rectangle(cx, cy, rect.width, rect.height, {
      restitution: CFG.restitution,
      friction: CFG.friction,
      frictionAir: CFG.frictionAir,
    });
    return { span, body, cx, cy, i };
  });

  // Only released letters are tracked here and transformed each frame;
  // pending letters stay pinned at their measured spot until they drop.
  const items = [];
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
    const settled =
      pending.length === 0 &&
      items.length > 0 &&
      items.every((it) => it.body.isSleeping);
    if (settled || frames > CFG.maxFrames) return; // rest
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

  // Drop a couple of letters at a time, in reading order.
  const releaseNext = () => {
    for (let n = 0; n < CFG.releaseBatch && pending.length > 0; n += 1) {
      const it = pending.shift();
      Body.setAngularVelocity(it.body, jitter(it.i) * CFG.spinFactor);
      Body.setVelocity(it.body, { x: jitter(it.i * 7) * CFG.kickFactor, y: 0 });
      Composite.add(engine.world, it.body);
      items.push(it);
    }
    if (pending.length > 0) setTimeout(releaseNext, CFG.releaseInterval);
  };
  releaseNext();
}

/* Beat 4: raise the final line into the now-empty center. */
function reveal() {
  revealEl.textContent = COPY.final;
  revealEl.classList.add("show");
}

/* Full sequence — plays once. */
async function runSequence() {
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (_) { /* ignore */ }
  }

  const glyphs = buildLetters([COPY.line1, COPY.line2]);

  await wait(CFG.enterDelay);
  heroEl.classList.add("entered");

  await wait(CFG.glitchDelay);
  const glitch = startGlitch(glyphs);

  await wait(CFG.glitchDuration);
  stopGlitch(glitch);
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
