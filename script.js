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
