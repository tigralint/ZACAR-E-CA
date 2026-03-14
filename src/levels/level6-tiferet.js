/**
 * ZACAR-E-CA · Phase VI — TIFERET (The Sacrifice of the Ego)
 * 
 * The mirror of beauty and sacrifice. 
 * Hostile OS mode: No UI. Hints hidden in the kernel console.
 */

import { gsap } from 'gsap';
import { logAetheris } from '../core/enochian.js';

let complete = false;
let overlay;
let mandala;
let egoInstance = null;
let fakeFetchTimer = 0;

function onEnter(engine) {
  complete = false;
  fakeFetchTimer = 0;

  engine.audio.setDroneLevel(0.6);
  engine.audio.setWhisperLevel(0.3);

  // Black void, no UI text
  engine.overlay.innerHTML = `
    <div id="l6-tiferet" style="
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    ">
      <div id="l6-mandala" style="
        width: 300px;
        height: 300px;
        border: 2px solid var(--gold);
        border-radius: 50%;
        box-shadow: 0 0 50px rgba(255, 215, 0, 0.2);
        opacity: 0.1;
        transform: rotate(0deg);
      "></div>
    </div>
  `;

  overlay = document.getElementById('l6-tiferet');
  mandala = document.getElementById('l6-mandala');

  // Kernel Hint
  logAetheris('error', "ENTITY_EGO_CORRUPTION: Holy memory space compromised by <div id='ego'>.");
  logAetheris('warn', "Manual DOM purge required to restore sanctity.");
  
  // Ensure the ego node exists (it should be in index.html, but let's ensure it's visible to the inspector)
  egoInstance = document.getElementById('ego');
  if (egoInstance) egoInstance.style.display = 'block';
}

function onUpdate(engine, dt) {
  if (complete) return;

  // Visual feedback: mandala rotation
  if (mandala) {
    const rotation = (Date.now() * 0.05) % 360;
    mandala.style.transform = `rotate(${rotation}deg) scale(${1 + Math.sin(Date.now() * 0.001) * 0.05})`;
    mandala.style.opacity = 0.1 + Math.random() * 0.05;
  }

  // Fake API error noise in Network tab
  fakeFetchTimer += dt;
  if (fakeFetchTimer > 5) {
    fetch('/api/v1/aetheris/purge_ego').catch(() => {});
    fakeFetchTimer = 0;
  }

  // Check if user deleted the #ego node
  const stillExists = document.getElementById('ego');
  if (!stillExists) {
    if (window._recalc_soul === 0) {
        complete = true;
        _onComplete();
    } else {
        // Subtle hint if they only deleted the node but didn't set the soul
        if (Math.random() > 0.99) {
            logAetheris('warn', "REMAINS OF SELF DETECTED. RECALIBRATE SOUL TO ZERO.");
        }
    }
  }

  // Atmosphere
  engine.setAnxiety(0.5);
}

function _onComplete() {
  logAetheris('liturgy');
  gsap.to(overlay || document.getElementById('l6-tiferet'), { 
    opacity: 0, 
    duration: 3, 
    onComplete: () => {
      if (onComplete) onComplete();
    }
  });
}

function onExit(engine) {
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
