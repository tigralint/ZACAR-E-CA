/**
 * ZACAR-E-CA · Phase VII — CHESED (The Mercy of the Digital Garden)
 * 
 * Restoration. Mercy. 
 * Trial: Heal the void holes by moving the cursor slowly over them.
 */

import { gsap } from 'gsap';
import { translate } from '../core/enochian.js';

let complete = false;
let holes = [];
const NUM_HOLES = 5;
let healedCount = 0;
let overlay;
let lastX = 0, lastY = 0;

function onEnter(engine) {
  complete = false;
  healedCount = 0;
  holes = [];
  lastX = engine._cursorX;
  lastY = engine._cursorY;

  engine.audio.setDroneLevel(0.1);
  engine.audio.setWhisperLevel(0.01);

  engine.overlay.innerHTML = `
    <div id="l7-chesed" style="
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: #000;
      overflow: hidden;
      cursor: none;
    ">
      <div id="l7-title" class="glitch level-text--large" data-text="C H E S E D" style="
        position: absolute; top: 10%; left: 50%; transform: translateX(-50%);
        font-family: var(--font-serif); color: #00ffff; opacity: 0.5;
      ">${translate("CHESED")}</div>

      <div id="l7-hint" style="
        position: absolute; bottom: 10%; left: 50%; transform: translateX(-50%);
        font-family: var(--font-mono); font-size: 0.8rem; color: #00ffff; opacity: 0.3;
        text-align: center;
      ">⸸ ${translate("LENITAS EST POTESTAS")} · ${translate("MOVE LENTE")} ⸸</div>
      
      <div id="l7-holes"></div>
    </div>
  `;

  overlay = document.getElementById('l7-chesed');
  const holesContainer = document.getElementById('l7-holes');

  for (let i = 0; i < NUM_HOLES; i++) {
    const hole = {
      x: 100 + Math.random() * (window.innerWidth - 200),
      y: 100 + Math.random() * (window.innerHeight - 200),
      progress: 0,
      healed: false,
      el: document.createElement('div')
    };
    hole.el.style.cssText = `
      position: absolute;
      left: ${hole.x - 50}px;
      top: ${hole.y - 50}px;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,0,0,0) 20%, rgba(0,255,255,0.1) 100%);
      border: 1px solid rgba(0,255,255,0.2);
      transition: transform 0.2s ease;
    `;
    holesContainer.appendChild(hole.el);
    holes.push(hole);
  }
}

function onUpdate(engine, dt) {
  if (complete) return;

  const curX = engine._cursorX;
  const curY = engine._cursorY;
  const distMove = Math.sqrt(Math.pow(curX - lastX, 2) + Math.pow(curY - lastY, 2));
  const velocity = distMove / dt; 
  
  lastX = curX;
  lastY = curY;

  const isSlow = velocity < 180; 

  holes.forEach(hole => {
    if (hole.healed) return;

    const dx = curX - hole.x;
    const dy = curY - hole.y;
    const dHole = Math.sqrt(dx*dx + dy*dy);

    if (dHole < 70) {
      if (isSlow) {
        hole.progress += dt * 0.4;
        hole.el.style.background = `radial-gradient(circle, rgba(0,255,255,${0.3 * hole.progress}) 0%, rgba(0,0,0,0) 70%)`;
      } else {
        hole.progress -= dt * 1.0;
        hole.el.style.borderColor = 'red';
        setTimeout(() => { if(hole.el) hole.el.style.borderColor = ''; }, 100);
      }
    } else {
      hole.progress -= dt * 0.1;
    }

    hole.progress = Math.max(0, Math.min(1, hole.progress));
    hole.el.style.transform = `scale(${1 - hole.progress * 0.4})`;

    if (hole.progress >= 1) {
      hole.healed = true;
      healedCount++;
      hole.el.style.boxShadow = '0 0 50px rgba(0, 255, 255, 0.5)';
      gsap.to(hole.el, { opacity: 0, scale: 2, duration: 1, onComplete: () => hole.el.remove() });
    }
  });

  const totalHealed = holes.reduce((sum, h) => sum + (h.healed ? 1 : 0), 0) / holes.length;
  engine.setAnxiety(0.3 - totalHealed * 0.3);
  engine.setRitualIntensity(0.002, 0.1 - totalHealed * 0.1);

  if (totalHealed >= 1.0) {
    complete = true;
    _onComplete();
  }
}

function _onComplete() {
  gsap.to(overlay, { 
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
