const projects = [
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

    const name = document.createElement("span");
    name.className = "project-name";
    name.textContent = project.name;

    const meta = document.createElement("span");
    meta.className = "project-meta";
    meta.textContent = "View project";

    link.append(name, meta);
    projectList.append(link);
  });
}

const sceneTarget = document.querySelector("#rain-scene");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (sceneTarget && window.THREE) {
  const { THREE } = window;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    48,
    window.innerWidth / window.innerHeight,
    0.1,
    90,
  );
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  const clock = new THREE.Clock();
  const pointer = new THREE.Vector2(0, 0);
  const lookTarget = new THREE.Vector3(0, 1.2, -1.5);
  const sceneLayout = {
    cameraY: 5.1,
    cameraZ: 12,
  };

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  sceneTarget.append(renderer.domElement);

  camera.position.set(0, sceneLayout.cameraY, sceneLayout.cameraZ);
  camera.lookAt(lookTarget);

  const ambient = new THREE.HemisphereLight(0x8e9aba, 0x10091a, 0.9);
  const stormLight = new THREE.DirectionalLight(0x879ad5, 1.05);
  const warmLight = new THREE.PointLight(0x9c6fc7, 0.48, 22);
  const lightning = new THREE.PointLight(0xdff7ff, 0, 34);

  stormLight.position.set(-5, 10, 4);
  warmLight.position.set(5, 2.5, 3);
  lightning.position.set(-3, 8, 1);
  scene.add(ambient, stormLight, warmLight, lightning);

  const rainGeometry = new THREE.BoxGeometry(0.035, 1.15, 0.035);
  const rainMaterial = new THREE.MeshBasicMaterial({
    color: 0x7fa9c4,
    transparent: true,
    opacity: 0.52,
  });
  const dropCount = 760;
  const rain = new THREE.InstancedMesh(rainGeometry, rainMaterial, dropCount);
  const dummy = new THREE.Object3D();
  const drops = [];

  for (let i = 0; i < dropCount; i += 1) {
    drops.push({
      x: (Math.random() - 0.5) * 28,
      y: Math.random() * 16 - 1,
      z: Math.random() * -18 + 7,
      speed: Math.random() * 3.6 + 5.4,
      scale: Math.random() * 0.75 + 0.55,
    });
  }

  scene.add(rain);

  const placeRain = () => {
    drops.forEach((drop, index) => {
      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.rotation.set(-0.18, 0, 0.09);
      dummy.scale.set(1, drop.scale, 1);
      dummy.updateMatrix();
      rain.setMatrixAt(index, dummy.matrix);
    });
    rain.instanceMatrix.needsUpdate = true;
  };

  const updatePointer = (event) => {
    const source = event.touches?.[0] || event;
    pointer.x = (source.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (source.clientY / window.innerHeight - 0.5) * 2;
  };

  const applySceneLayout = () => {
    const compact = window.innerWidth < 620;
    sceneLayout.cameraY = compact ? 4.9 : 5.1;
    sceneLayout.cameraZ = compact ? 12.6 : 12;
    camera.fov = compact ? 54 : 48;
    camera.position.z = sceneLayout.cameraZ;
    camera.updateProjectionMatrix();
  };

  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    applySceneLayout();
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  };

  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("touchmove", updatePointer, { passive: true });
  window.addEventListener("resize", resize);

  const animate = () => {
    const delta = Math.min(clock.getDelta(), 0.04);
    const elapsed = clock.elapsedTime;

    camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.035;
    camera.position.y +=
      (sceneLayout.cameraY - pointer.y * 0.28 - camera.position.y) * 0.03;
    camera.position.z += (sceneLayout.cameraZ - camera.position.z) * 0.03;
    camera.lookAt(lookTarget);

    drops.forEach((drop) => {
      drop.y -= drop.speed * delta;
      drop.x -= delta * 0.78;
      if (drop.y < -2.3) {
        drop.y = Math.random() * 4 + 10.5;
        drop.x = (Math.random() - 0.5) * 28;
        drop.z = Math.random() * -18 + 7;
      }
    });
    placeRain();

    const flash =
      Math.sin(elapsed * 0.78) > 0.992 || Math.sin(elapsed * 0.47 + 3.1) > 0.996;
    lightning.intensity = flash ? 4.6 : Math.max(0, lightning.intensity - delta * 7);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  applySceneLayout();
  placeRain();

  if (prefersReducedMotion) {
    camera.position.set(0, sceneLayout.cameraY, sceneLayout.cameraZ);
    renderer.render(scene, camera);
  } else {
    animate();
  }
}
