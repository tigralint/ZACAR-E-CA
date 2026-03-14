/**
 * ZACAR-E-CA · Phase VI — TIFERET (The Beauty of the Sacrifice)
 * 
 * The Mandala of the Ego. To pass, the initiate must erase themselves.
 * 
 * Trials:
 * 1. Delete the DOM node <div id="ego"> from the target memory.
 * 2. Purge the global soul: set 'window._recalc_soul' to 0 in the terminal.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { translate } from '../core/enochian.js';

let scene, camera, mandalaGroup;
let complete = false;
let observer;
let elapsedTime = 0;

function onEnter(engine) {
  complete = false;
  elapsedTime = 0;
  window._recalc_soul = 1.0; 
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 15;

  _createMandala();

  engine.renderer.setActive(scene, camera);

  engine.overlay.innerHTML = `
    <div id="l6-tiferet" style="
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    ">
      <div id="l6-title" class="glitch level-text--large" data-text="T I F E R E T" style="
        font-family: var(--font-serif);
        color: gold;
        opacity: 0.8;
      ">${translate("TIFERET")}</div>
      
      <div id="l6-instruction" style="
        margin-top: 2rem;
        font-family: var(--font-mono);
        font-size: 1rem;
        color: var(--bone);
        letter-spacing: 0.3em;
        opacity: 0.6;
        text-shadow: 0 0 10px gold;
      ">${translate("FAC SACRIFICIUM EGO TUI")}</div>
      <div style="
        position: absolute; bottom: 10%; font-family: var(--font-mono); font-size: 0.6rem;
        color: rgba(255, 215, 0, 0.2); text-align: center;
      ">"NAM QUI VOLUERIT ANIMAM SUAM SALVAM FACERE PERDET EAM..." [F12]</div>
    </div>
  `;

  // Make the #ego node available for this level
  const egoNode = document.getElementById('ego');
  if (egoNode) {
    egoNode.style.display = 'block';
  }

  observer = new MutationObserver((mutations) => {
    const isEgoGone = !document.getElementById('ego');
    if (isEgoGone && (window._recalc_soul === 0) && !complete) {
      complete = true;
      _onSacrificeMade(engine);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function _createMandala() {
  mandalaGroup = new THREE.Group();
  scene.add(mandalaGroup);

  const geometry = new THREE.TorusKnotGeometry(4, 0.1, 200, 32, 2, 3);
  const material = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true });
  
  for (let i = 0; i < 8; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.z = (Math.PI / 4) * i;
    mandalaGroup.add(mesh);
  }

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
  );
  scene.add(ball);
}

function onUpdate(engine, dt) {
  if (complete) return;
  elapsedTime += dt;

  if (mandalaGroup) {
    mandalaGroup.rotation.z += dt * 0.2;
    mandalaGroup.scale.setScalar(1 + Math.sin(elapsedTime) * 0.05);
    
    const anxiety = Math.min(1, elapsedTime / 120);
    engine.setAnxiety(anxiety);
    engine.setRitualIntensity(0.002 + anxiety * 0.01, 0.08 + anxiety * 0.2);
  }

  const egoGone = !document.getElementById('ego');
  const soulPurged = (window._recalc_soul === 0);

  if (egoGone && soulPurged && !complete) {
    complete = true;
    _onSacrificeMade(engine);
  }
}

function _onSacrificeMade(engine) {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed; top:0; left:0; width:100%; height:100%;
    background: white; z-index: 1000;
  `;
  document.body.appendChild(flash);

  gsap.to(flash, { opacity: 0, duration: 4, onComplete: () => flash.remove() });

  mandalaGroup.children.forEach(m => {
    m.material.color.setHex(0xffffff);
    m.material.wireframe = false;
    m.material.transparent = true;
    gsap.to(m.material, { opacity: 0, duration: 3 });
    gsap.to(m.scale, { x: 5, y: 5, z: 5, duration: 3 });
  });

  const instr = document.getElementById('l6-instruction');
  if (instr) {
    instr.innerText = translate("SACRIFICE ACCEPTED");
    instr.style.color = "white";
  }

  setTimeout(() => {
    if (onComplete) onComplete();
  }, 4000);
}

function onExit(engine) {
  if (observer) observer.disconnect();
  const ego = document.getElementById('ego');
  if (ego) ego.style.display = 'none';
  engine.overlay.innerHTML = '';
}

let onComplete = null;

export default {
  onEnter,
  onUpdate,
  onExit,
  set onComplete(cb) { onComplete = cb; },
  get onComplete() { return onComplete; },
};
