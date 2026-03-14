/**
 * ZACAR-E-CA · Phase I — MALKUTH (The Heavy Sin)
 * 
 * Digital Brutalism. The cursor is artificially slowed to near-freezing.
 * The initiate must drag the heavy cursor to an invisible pixel somewhere on screen.
 * 
 * Mechanic: Cursor lag is set to ~0.005 (extreme delay).
 * A hidden "exit point" (invisible pixel) is placed randomly.
 * When the cursor enters its hitbox, the ritual completes.
 * 
 * Visual: Dark, heavy textures. Text in Enochian & Latin.
 * Dynamic chromatic aberration based on 'Sin Proximity'.
 */

import * as THREE from 'three';
import { zalgoify } from '../core/zalgo.js';
import { translate } from '../core/enochian.js';

let scene, camera;
let exitPoint = { x: 0, y: 0 };
let exitHitbox = 30;
let found = false;
let elapsedTime = 0;
let textMeshes = [];
let hintOpacity = 0;

// Enochian phrases (Theological roots)
const ENOCHIAN_LINES = [
  'ZACAR OD ZAMRAN',
  'MICALZO PILZIN',
  'ADAREPANU EGO',
  'IAD GIGIPA',
  'MICMA VOHIM',
  'SIGILLUM I',
  'SOLVE ET COAGULA',
  'NON NOBIS DOMINE',
];

/**
 * Called when entering this level.
 */
async function onEnter(engine) {
  found = false;
  elapsedTime = 0;
  hintOpacity = 0;

  // Set extreme cursor lag (the core mechanic of this level)
  engine.setCursorLag(0.006);

  // Audio: increase drone, decrease whispers
  engine.audio.setDroneLevel(0.4);
  engine.audio.setWhisperLevel(0.04);

  // Three.js scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  scene.fog = new THREE.FogExp2(0x050505, 0.05);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 5;

  // Create floating Enochian text sprites
  _createTextSprites();

  // Create ambient particles (dust)
  _createDust();

  // Random exit point
  exitPoint.x = 100 + Math.random() * (window.innerWidth - 200);
  exitPoint.y = 100 + Math.random() * (window.innerHeight - 200);

  // Mount scene
  engine.renderer.setActive(scene, camera);

  // Add UI hint (appears after delay)
  const overlay = engine.overlay;
  overlay.innerHTML = `
    <div id="l1-ui" style="
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    ">
      <div id="l1-title" class="glitch" data-text="M A L K U T H" style="
        font-family: var(--font-serif);
        font-size: clamp(2rem, 5vw, 4rem);
        color: var(--bone);
        letter-spacing: 0.5em;
        opacity: 0.7;
        text-shadow: 0 0 30px rgba(139,0,0,0.3);
      ">${translate("MALKUTH")}</div>
      <div id="l1-subtitle" style="
        font-family: var(--font-mono);
        font-size: 0.7rem;
        color: rgba(139,0,0,0.5);
        margin-top: 2rem;
        letter-spacing: 0.3em;
        opacity: 0;
        transition: opacity 3s ease;
      ">⸸ ${translate("PONDUS PECCATI")} · ${translate("INQUISITIO")} ⸸</div>
      <div id="l1-hint" style="
        position: absolute;
        bottom: 2rem;
        font-family: var(--font-mono);
        font-size: 0.6rem;
        color: rgba(212,197,169,0.15);
        letter-spacing: 0.2em;
        opacity: 0;
        transition: opacity 5s ease;
      ">GRAVITAS NON DIMITTI...</div>
    </div>
  `;

  // Create an invisible visual hint near the exit point (very subtle glow)
  const hintEl = document.createElement('div');
  hintEl.id = 'l1-exitglow';
  hintEl.style.cssText = `
    position: fixed;
    left: ${exitPoint.x - 20}px;
    top: ${exitPoint.y - 20}px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,0,0,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 11;
    opacity: 0;
    transition: opacity 10s ease;
  `;
  document.body.appendChild(hintEl);

  // Show subtitle after 5s
  setTimeout(() => {
    const sub = document.getElementById('l1-subtitle');
    if (sub) sub.style.opacity = '1';
  }, 5000);

  // Show glow hint after 20s
  setTimeout(() => {
    hintEl.style.opacity = '1';
  }, 20000);

  // Show text hint after 30s
  setTimeout(() => {
    const hint = document.getElementById('l1-hint');
    if (hint) hint.style.opacity = '1';
  }, 30000);
}

/**
 * Called every frame.
 */
function onUpdate(engine, dt) {
  if (found) return;

  elapsedTime += dt;

  // Animate text sprites
  textMeshes.forEach((sprite, i) => {
    sprite.position.x += Math.sin(elapsedTime * 0.3 + i) * 0.002;
    sprite.position.y += Math.cos(elapsedTime * 0.2 + i * 1.5) * 0.001;
    sprite.material.opacity = 0.1 + Math.sin(elapsedTime * 0.5 + i * 0.7) * 0.05;
  });

  // Slowly rotate camera for unease
  camera.rotation.z = Math.sin(elapsedTime * 0.1) * 0.01;

  // Check if cursor reached exit point
  const dx = engine._cursorX - exitPoint.x;
  const dy = engine._cursorY - exitPoint.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < exitHitbox) {
    found = true;
    _onFound(engine);
  }

    // Proximity-based atmospheric pressure
    const maxRange = 600;
    const intensity = Math.max(0, 1 - dist / maxRange);
    
    if (elapsedTime > 5) {
      engine.audio.setDroneLevel(0.4 + intensity * 0.4);
      engine.audio.setWhisperLevel(0.04 + intensity * 0.2);
      
      // Anxiety & Shader reaction
      engine.setAnxiety(intensity);
      engine.setRitualIntensity(0.002 + intensity * 0.05, 0.08 + intensity * 0.15);
    }
}

/**
 * Player found the invisible pixel!
 */
function _onFound(engine) {
  // Flash the exit glow
  const glow = document.getElementById('l1-exitglow');
  if (glow) {
    glow.style.background = 'radial-gradient(circle, rgba(139,0,0,0.8) 0%, transparent 70%)';
    glow.style.opacity = '1';
    glow.style.transition = 'opacity 0.3s ease';
  }

  // Flash screen
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed; top:0; left:0; width:100%; height:100%;
    background: rgba(139,0,0,0.15); z-index: 99;
    animation: fadeout 2s forwards;
  `;
  document.body.appendChild(flash);

  // Add fadeout animation
  const style = document.createElement('style');
  style.textContent = `@keyframes fadeout { to { opacity: 0; } }`;
  document.head.appendChild(style);

  setTimeout(() => {
    flash.remove();
    style.remove();
    if (glow) glow.remove();

    // Advance to next level
    if (onComplete) onComplete();
  }, 2000);
}

/**
 * Create floating text sprites in 3D space.
 */
function _createTextSprites() {
  textMeshes = [];

  ENOCHIAN_LINES.forEach((text, i) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 64;

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 512, 64);
    ctx.font = '20px "Share Tech Mono", monospace';
    ctx.fillStyle = `rgba(139, 0, 0, 0.15)`;
    ctx.textAlign = 'center';
    ctx.fillText(zalgoify(text, 0.3), 256, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.1,
      depthTest: false,
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(8, 1, 1);
    sprite.position.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6 - 2
    );

    scene.add(sprite);
    textMeshes.push(sprite);
  });
}

/**
 * Create ambient dust particles.
 */
function _createDust() {
  const count = 500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x4a0000, // Deeper, dried blood color
    size: 0.015,
    transparent: true,
    opacity: 0.2,
    depthTest: false,
  });

  const dust = new THREE.Points(geometry, material);
  scene.add(dust);
}

/**
 * Called when exiting this level.
 */
async function onExit(engine) {
  // Restore cursor lag to normal
  engine.setCursorLag(0.15);

  // Clean up UI
  engine.overlay.innerHTML = '';
  const glow = document.getElementById('l1-exitglow');
  if (glow) glow.remove();

  // Clean up Three.js
  scene.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (obj.material.map) obj.material.map.dispose();
      obj.material.dispose();
    }
  });

  textMeshes = [];
  scene = null;
  camera = null;

  engine.audio.setDroneLevel(0.25);
  engine.audio.setWhisperLevel(0.08);
  engine.renderer.clearActive();
}

// Completion callback (set by StateManager)
let onComplete = null;

export default {
  onEnter,
  onUpdate,
  onExit,
  set onComplete(cb) { onComplete = cb; },
  get onComplete() { return onComplete; },
};
