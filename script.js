const projects = [
  // Add projects here when you want them visible:
  { name: "Doodler", url: "https://doodler-rouge.vercel.app/" },
  { name: "Wiz duel", url: "https://wiz-duel.vercel.app/" },
];

const projectSection = document.querySelector(".projects");
const projectList = document.querySelector("[data-project-list]");

if (projects.length > 0 && projectSection && projectList) {
  projectSection.hidden = false;

  projects.forEach((project) => {
    const link = document.createElement("a");
    link.className = "project-link";
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = project.name;
    projectList.append(link);
  });
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const backgroundTarget = document.querySelector("#vanta-bg");

if (!prefersReducedMotion && backgroundTarget && window.VANTA?.TRUNK && window.p5 && window.THREE) {
  VANTA.TRUNK({
    el: backgroundTarget,
    THREE: window.THREE,
    p5: window.p5,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200,
    minWidth: 200,
    scale: 1,
    scaleMobile: 1,
    color: "blue",
    backgroundColor: 0x08090b,
    spacing: 4,
    chaos: 4,
  });
//   VANTA.WAVES({
//   el: "#your-element-selector",
//   mouseControls: true,
//   touchControls: true,
//   gyroControls: false,
//   minHeight: 200.00,
//   minWidth: 200.00,
//   scale: 1.00,
//   scaleMobile: 1.00,
//   color: 0x80516,
//   shininess: 150.00,
//   waveHeight: 7.00,
//   waveSpeed: 1.85,
//   zoom: 0.80
// })
}
