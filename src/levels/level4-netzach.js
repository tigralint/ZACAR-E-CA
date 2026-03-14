/**
 * ZACAR-E-CA · Phase IV — NETZACH (The Victory of the Spire)
 * 
 * Hostile OS mode: No progress bars. Pure Shepard Tone descent.
 */

import { gsap } from 'gsap';
import { logAetheris } from '../core/enochian.js';

let complete = false;
let scrollDist = 0;
let progress = 0;
const WIN_PROGRESS = 72; 
let asciiContainer;
let shepardOscillators = [];
let shepardGains = [];
let audioCtx;

function onEnter(engine) {
  complete = false;
  scrollDist = 0;
  progress = 0;

  engine.audio.setDroneLevel(0.2);
  engine.audio.setWhisperLevel(0.4);

  engine.overlay.innerHTML = `
    <div id="l4-netzach" style="
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: #000;
      color: #00ff41;
      font-family: var(--font-mono);
      overflow: hidden;
    ">
      <div id="l4-ascii" style="
        font-size: 8px;
        line-height: 8px;
        white-space: pre;
        opacity: 0.3;
        transition: transform 0.1s linear;
      "></div>
    </div>
  `;

  asciiContainer = document.getElementById('l4-ascii');
  _generateAscii(200);

  this._onWheel = (e) => {
    if (complete) return;
    scrollDist += Math.abs(e.deltaY);
    if (scrollDist > 1000) {
      progress++;
      scrollDist = 0;
      _updateShepard();
      _generateAscii(50, true);
      
      if (progress >= WIN_PROGRESS) {
        complete = true;
        _onComplete();
      }
    }
  };

  window.addEventListener('wheel', this._onWheel);

  // Shepard Tone Init
  audioCtx = engine.audio.getContext();
  const bus = engine.audio.getLevelBus();
  
  for (let i = 0; i < 5; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(bus);
    osc.start();
    shepardOscillators.push(osc);
    shepardGains.push(gain);
  }

  logAetheris('warn', "ASCENT_ANOMALY: Vertical synchronization lost. Reach the 72nd Name via harmonic resonance.");
}

function _updateShepard() {
  const baseFreq = 100 + (progress / WIN_PROGRESS) * 400;
  shepardOscillators.forEach((osc, i) => {
    const f = baseFreq * Math.pow(2, i);
    osc.frequency.setTargetAtTime(f, audioCtx.currentTime, 0.1);
    
    // Gain envelope for infinite effect
    const g = Math.sin((progress / WIN_PROGRESS + i/5) * Math.PI);
    shepardGains[i].gain.setTargetAtTime(Math.max(0, g * 0.1), audioCtx.currentTime, 0.1);
  });
}

function _generateAscii(lines, append = false) {
  const chars = "⸸⛧🜏🜓010101#@%&*";
  let content = "";
  for (let i = 0; i < lines; i++) {
    let row = "";
    for (let j = 0; j < 100; j++) {
      row += chars[Math.floor(Math.random() * chars.length)];
    }
    content += row + "\n";
  }
  if (append) {
    asciiContainer.innerText = content + asciiContainer.innerText.substring(0, 5000);
  } else {
    asciiContainer.innerText = content;
  }
}

function onUpdate(engine, dt) {
  if (complete) return;
  
  // Distort ASCII
  if (asciiContainer) {
    asciiContainer.style.transform = `translate(${(Math.random()-0.5)*5}px, ${(Math.random()-0.5)*5}px)`;
  }

  engine.setAnxiety(progress / WIN_PROGRESS);
}

function _onComplete() {
  logAetheris('liturgy');
  gsap.to(asciiContainer, { 
    opacity: 0, 
    scale: 0.1,
    duration: 3, 
    onComplete: () => {
      if (onComplete) onComplete();
    }
  });
}

function onExit(engine) {
  window.removeEventListener('wheel', this._onWheel);
  shepardOscillators.forEach(osc => osc.stop());
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
