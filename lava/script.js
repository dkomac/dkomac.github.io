// Lava-lamp blobs: soft grey shapes that rise ~200-300px from the bottom edge
// and sink back on their own slow, offset cycles. The #goo SVG filter (see
// index.html) merges neighbouring blobs so they melt together like lava wax.

const lava = document.querySelector(".lava");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const rand = (min, max) => min + Math.random() * (max - min);

// Build a fresh set of blobs sized to the current viewport.
function createBlobs() {
  lava.replaceChildren();

  const w = window.innerWidth;
  const count = w < 600 ? 14 : w < 1000 ? 22 : 30;
  const sizeScale = w < 600 ? 0.7 : 1;
  const blobs = [];

  for (let i = 0; i < count; i += 1) {
    const el = document.createElement("div");
    el.className = "blob";

    const size = rand(45, 105) * sizeScale;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    // Spread blobs evenly across the width with a little jitter, anchored so
    // they half-emerge from the bottom edge at rest.
    const x = ((i + 0.5) / count) * w + rand(-50, 50);
    el.style.left = `${x - size / 2}px`;
    el.style.bottom = `${-size * 0.55}px`;

    lava.append(el);

    const period = rand(7, 13); // seconds for a full rise-and-fall
    blobs.push({
      el,
      amp: rand(200, 300), // how far it rises, in px
      omega: (Math.PI * 2) / period,
      phase: Math.random() * Math.PI * 2,
      swayAmp: rand(18, 55),
      swayOmega: (Math.PI * 2) / rand(9, 17),
      swayPhase: Math.random() * Math.PI * 2,
    });
  }

  return blobs;
}

let blobs = createBlobs();

const renderAt = (t) => {
  for (const b of blobs) {
    // cos starts at 1 -> rise 0, so each blob begins resting at the bottom.
    const rise = b.amp * (0.5 - 0.5 * Math.cos(t * b.omega + b.phase));
    const sway = b.swayAmp * Math.sin(t * b.swayOmega + b.swayPhase);
    const scale = 1 + 0.12 * Math.sin(t * b.omega + b.phase);
    b.el.style.transform = `translate3d(${sway}px, ${-rise}px, 0) scale(${scale})`;
  }
};

if (prefersReducedMotion) {
  // Settle the blobs at a pleasant mid-rise, no animation.
  for (const b of blobs) {
    b.el.style.transform = `translate3d(0, ${-b.amp * 0.45}px, 0)`;
  }
} else {
  const start = performance.now();
  const frame = (now) => {
    renderAt((now - start) / 1000);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// Rebuild on resize so blob spread and sizing track the viewport.
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    blobs = createBlobs();
    if (prefersReducedMotion) {
      for (const b of blobs) {
        b.el.style.transform = `translate3d(0, ${-b.amp * 0.45}px, 0)`;
      }
    }
  }, 200);
});
