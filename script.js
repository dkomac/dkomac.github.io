/* ============================================================
   Physics-text landing — glitch, shatter & pile, reveal.
   The name fades in; one or two characters glitch between their
   letter and a CJK glyph; then every glyph drops straight down
   from its place and piles on the floor; a final line reveals.
   Plays once on load. Theme via <html data-theme>.
   ============================================================ */

/* ---- copy (edit here) ---- */
const COPY = {
  line1: "dennis komac",
  line2: "let's build something.",
  final: "or break things. whatever floats your boat.",
};

/* ---- glitch glyph pools. Swap CFG.flickerPool to change the script. ---- */
const SCRIPTS = {
  // Korean (Hangul syllables)
  korean: "가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후그느드르므브스이지치키히",
  // Chinese (common Hanzi)
  chinese: "海風山川光時空夢花月雪火水木金土日月生愛道德無心力天地人和氣理形色音雨雷電星雲霧",
};

/* ---- tuning (edit the feel here) ---- */
const CFG = {
  enterDelay: 350,        // ms after load before text fades in
  flickerDelay: 900,      // ms the name stays readable before the glitch
  flickerDuration: 1100,  // ms of glitching before the collapse
  flickerTick: 110,       // ms between glitch swaps (real letter ⇄ CJK)
  flickerCount: 2,        // how many characters glitch (just one or two)
  flickerPool: SCRIPTS.korean, // characters the glitch swaps in (SCRIPTS.chinese for Chinese)
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
      span.dataset.char = ch;       // remember the real letter to restore after the glitch
      line.append(span);
      glyphs.push(span);
    }
    heroEl.append(line);
  });
  return glyphs;
}

/* Pick a few distinct glyph indices (deterministic, scattered via jitter). */
function pickFlickerIndices(total, count) {
  const picks = [];
  let i = 0;
  while (picks.length < Math.min(count, total) && i < total * 8) {
    const k = Math.floor((jitter(i * 5 + 3) * 0.5 + 0.5) * total) % total;
    if (!picks.includes(k)) picks.push(k);
    i += 1;
  }
  return picks;
}

/* Beat 2: glitch just one or two characters — each chosen glyph flickers
   between its real letter and a CJK character; the rest stay readable.
   Returns { id, picks } so the caller can stop it and restore the letters. */
function startFlicker(glyphs) {
  const pool = CFG.flickerPool;
  const picks = pickFlickerIndices(glyphs.length, CFG.flickerCount).map((k) => glyphs[k]);
  picks.forEach((span) => {
    // Pin the box to the letter's natural size, then let a wider/taller CJK
    // glyph overflow visually instead of reflowing the line. The text never
    // moves — it just drops from exactly where it sits.
    const r = span.getBoundingClientRect();
    span.style.width = `${r.width}px`;
    span.style.height = `${r.height}px`;
    span.style.overflow = "visible";
    span.style.textAlign = "center";
  });
  let tick = 0;
  const id = setInterval(() => {
    tick += 1;
    picks.forEach((span, j) => {
      span.textContent = tick % 2 === 0
        ? pool[(tick * 7 + j * 13) % pool.length]
        : span.dataset.char;
    });
  }, CFG.flickerTick);
  return { id, picks };
}

/* Stop the glitch and restore every flickered glyph to its real letter. */
function stopFlicker(flicker) {
  clearInterval(flicker.id);
  flicker.picks.forEach((span) => {
    span.textContent = span.dataset.char;
    span.style.removeProperty("width");
    span.style.removeProperty("height");
    span.style.removeProperty("overflow");
    span.style.removeProperty("text-align");
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

  // Prepare every glyph: pin it in place and build its body, but hold the
  // body out of the world until it's this letter's turn to drop.
  const pending = [];
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
    pending.push({ span, body, cx, cy, i });
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

  await wait(CFG.flickerDelay);
  const flicker = startFlicker(glyphs);

  await wait(CFG.flickerDuration);
  stopFlicker(flicker);
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
