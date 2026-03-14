/**
 * ZACAR-E-CA · Phase I — MALKUTH (The Heavy Sin)
 * 
 * Hostile OS mode: No hints. Pure intuition and sensory feedback.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { zalgoify } from '../core/zalgo.js';
import { logAetheris, getLiturgy } from '../core/enochian.js';

let scene, camera;
let exitPoint = { x: 0, y: 0 };
let exitHitbox = 40;
let found = false;
let elapsedTime = 0;
let textMeshes = [];

const ENOCHIAN_LINES = [
  'ZACAR OD ZAMRAN',
  'MICALZO PILZIN',
  'ADAREPANU EGO',
  'IAD GIGIPA',
  'MICMA VOHIM',
  'SOLVE ET COAGULA',
];

async function onEnter(engine) {
  found = false;
  elapsedTime = 0;

  engine.setCursorLag(0.005);
  engine.audio.setDroneLevel(0.4);
  engine.audio.setWhisperLevel(0.04);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020000);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  _createTextSprites();

  // Random exit point based on RITUAL_SEED
  const simplex = (x) => Math.sin(x * engine.RITUAL_SEED);
  exitPoint.x = 200 + (simplex(1) * 0.5 + 0.5) * (window.innerWidth - 400);
  exitPoint.y = 200 + (simplex(2) * 0.5 + 0.5) * (window.innerHeight - 400);

  engine.renderer.setActive(scene, camera);
  engine.overlay.innerHTML = ''; // NO TEXT.

  logAetheris('error', "MALKUTH_GRAVITY_OVERFLOW: Soul weight detected. Locate bypass point via sensory resonance.");
}

function onUpdate(engine, dt) {
  if (found) return;
  elapsedTime += dt;

  textMeshes.forEach((sprite, i) => {
    sprite.position.x += Math.sin(elapsedTime * 0.3 + i) * 0.002;
    sprite.position.y += Math.cos(elapsedTime * 0.2 + i * 1.5) * 0.001;
    sprite.material.opacity = 0.05 + Math.sin(elapsedTime * 0.5 + i * 0.7) * 0.05;
  });

  const dx = engine._cursorX - exitPoint.x;
  const dy = engine._cursorY - exitPoint.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < exitHitbox) {
    found = true;
    _onFound(engine);
  }

  // Sensory feedback
  const intensity = Math.max(0, 1 - dist / 500);
  engine.audio.setDroneLevel(0.4 + intensity * 0.6);
  engine.setAnxiety(intensity);
  engine.setRitualIntensity(intensity * 0.1, intensity * 0.4);
}

function _onFound(engine) {
  logAetheris('liturgy');
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed; top:0; left:0; width:100%; height:100%;
    background: #400; z-index: 99;
    animation: fadeout 2s forwards;
  `;
  document.body.appendChild(flash);

  setTimeout(() => {
    flash.remove();
    if (onComplete) onComplete();
  }, 2000);
}

function _createTextSprites() {
  ENOCHIAN_LINES.forEach((text, i) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 64;
    ctx.font = '20px "Share Tech Mono", monospace';
    ctx.fillStyle = `rgba(139, 0, 0, 0.2)`;
    ctx.textAlign = 'center';
    ctx.fillText(zalgoify(text, 0.5), 256, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.1 });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(8, 1, 1);
    sprite.position.set((Math.random()-0.5)*15, (Math.random()-0.5)*12, (Math.random()-0.5)*8);
    scene.add(sprite);
    textMeshes.push(sprite);
  });
}

function onExit(engine) {
  engine.setCursorLag(0.15);
  engine.overlay.innerHTML = '';
  scene.clear();
}

let onComplete = null;

export default {
  onEnter,
  onUpdate,
  onExit,
  set onComplete(cb) { onComplete = cb; },
  get onComplete() { return onComplete; },
};
