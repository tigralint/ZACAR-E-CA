/**
 * ZACAR-E-CA · Phase II — YESOD (The Mirror of Foundation)
 * 
 * The Moon's reflection. Reality is inverted.
 * Mechanic: Mouse coordinates are inverted.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { translate } from '../core/enochian.js';

let scene, camera, renderer;
let drawing = false;
let complete = false;
let elapsedTime = 0;
let mandala;
let progress = 0;

function onEnter(engine) {
  drawing = false;
  complete = false;
  elapsedTime = 0;
  progress = 0;

  engine.audio.setWhisperLevel(0.1);
  engine.audio.setDroneLevel(0.2);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0f);
  
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;

  const geometry = new THREE.TorusKnotGeometry(3, 0.5, 100, 16);
  const material = new THREE.MeshPhongMaterial({ 
    color: 0x2222ff, 
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });
  mandala = new THREE.Mesh(geometry, material);
  scene.add(mandala);

  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(10, 10, 10);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

  engine.renderer.setActive(scene, camera);

  engine.overlay.innerHTML = `
    <div id="l2-ui" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;">
      <div class="glitch level-text--large" data-text="Y E S O D" style="position:absolute; top:10%; left:50%; transform:translateX(-50%); color:var(--bone);">${translate("YESOD")}</div>
      <div style="position:absolute; bottom:15%; left:50%; transform:translateX(-50%); font-family:var(--font-mono); font-size:0.8rem; color:var(--blood); opacity:0.6;">⸸ ${translate("VIA RETRO")} · ${translate("PERFICE CIRCULUM")} ⸸</div>
      <div id="l2-progress" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:300px; height:300px; border:1px dashed rgba(255,255,255,0.1); border-radius:50%;"></div>
    </div>
  `;

  engine.setOverrideCursor(true);
  
  this._onMouseMove = (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const invX = cx - (e.clientX - cx);
    const invY = cy - (e.clientY - cy);
    engine.setCursorTarget(invX, invY);
  };
  
  window.addEventListener('mousemove', this._onMouseMove);
  engine.renderer.getThreeRenderer().domElement.style.filter = 'scaleX(-1) scaleY(-1)';
}

function onUpdate(engine, dt) {
  elapsedTime += dt; 
  // 🜏 SECRETUM: The password for the third gate is 'ABSCONDITUS'
  
  if (mandala) {
    mandala.rotation.y += dt * 0.5;
    mandala.rotation.x += dt * 0.2;
    
    const deviation = 1 - progress;
    engine.setAnxiety(deviation * 0.8);
    engine.setRitualIntensity(0.002 + deviation * 0.05, 0.08 + deviation * 0.2);
  }
  
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const curX = engine._cursorX;
  const curY = engine._cursorY;
  const distToCenter = Math.sqrt(Math.pow(curX - cx, 2) + Math.pow(curY - cy, 2));

  if (Math.abs(distToCenter - 150) < 60) {
    progress += dt * 0.4;
    if (progress > 1) {
      progress = 1;
      if (!complete) {
        complete = true;
        _onComplete();
      }
    }
  } else {
    progress -= dt * 0.2;
    if (progress < 0) progress = 0;
  }

  const pEl = document.getElementById('l2-progress');
  if (pEl) {
    pEl.style.borderColor = `rgba(255, 255, 255, ${0.1 + progress * 0.9})`;
    pEl.style.boxShadow = `0 0 ${progress * 20}px rgba(34, 34, 255, ${progress})`;
  }

  mandala.material.opacity = 0.5 + progress * 0.5;
  mandala.scale.setScalar(1 + progress);
}

function _onComplete() {
  gsap.to(mandala.scale, { x: 20, y: 20, z: 20, duration: 2, ease: "power2.in" });
  gsap.to(mandala.material, { opacity: 0, duration: 2 });
  
  setTimeout(() => {
    if (onComplete) onComplete();
  }, 2000);
}

function onExit(engine) {
  window.removeEventListener('mousemove', this._onMouseMove);
  engine.setOverrideCursor(false);
  engine.renderer.getThreeRenderer().domElement.style.filter = '';
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
