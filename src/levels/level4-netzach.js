/**
 * ZACAR-E-CA · Phase IV — NETZACH (The Victory of the Spire)
 * 
 * The infinite ascent. ASCII storms.
 * Trial: 
 * - Continuous scroll downward.
 * - Reaching the 72nd Name of the Aetheris Kernel.
 */

import { gsap } from 'gsap';
import { translate } from '../core/enochian.js';

let complete = false;
let scrollDist = 0;
let lastScrollTime = 0;
let progress = 0;
const WIN_PROGRESS = 72; 
let asciiContainer;
let shepardOscillators = [];
let shepardGains = [];
let totalShift = 0;

function onEnter(engine) {
  complete = false;
  scrollDist = 0;
  progress = 0;
  totalShift = 0;
  lastScrollTime = Date.now();

  _initShepardTone(engine.audio);

  engine.overlay.innerHTML = `
    <div id="l4-netzach" style="
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: #000;
      overflow-y: hidden;
      font-family: var(--font-mono);
      font-size: 0.6rem;
      color: rgba(212, 197, 169, 0.4);
      line-height: 1.2;
      padding: 10px;
      user-select: none;
    ">
      <div id="l4-title" style="position:fixed; top:10%; right:10%; text-align:right; font-family:var(--font-serif); font-size:3rem; color:var(--bone); opacity:0.2; pointer-events:none; z-index:100;">${translate("NETZACH")}</div>
      <div id="l4-ascii-wrapper" style="position:absolute; top:0; left:0; width:100%;">
        <div id="l4-ascii" style="width:100%; white-space:pre-wrap;"></div>
      </div>
      <div id="l4-distance" style="position:fixed; bottom:20px; right:20px; font-size:0.5rem; opacity:0.3;">${translate("ITERUM")}: 0.000m | ${translate("NOMINA")}: 0/72</div>
    </div>
  `;

  asciiContainer = document.getElementById('l4-ascii');
  const asciiWrapper = document.getElementById('l4-ascii-wrapper');
  _generateAscii(150);

  this._onScroll = (e) => {
    if (complete) return;
    const delta = Math.abs(e.deltaY);
    scrollDist += delta;
    totalShift -= delta;
    lastScrollTime = Date.now();
    
    if (scrollDist % 500 < 50) {
      _generateAscii(15);
      if (asciiContainer.children.length > 100) {
        const first = asciiContainer.firstChild;
        const h = first.offsetHeight;
        asciiContainer.removeChild(first);
        totalShift += h;
      }
    }
    
    gsap.to(asciiWrapper, { y: totalShift, duration: 0.2, overwrite: 'auto' });
  };

  window.addEventListener('wheel', this._onScroll);
}

function _initShepardTone(audio) {
  const ctx = audio.getContext();
  const bus = audio.getLevelBus();
  shepardOscillators = [];
  shepardGains = [];
  const numOsc = 6;
  const baseFreq = 40;

  for (let i = 0; i < numOsc; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = baseFreq * Math.pow(2, i);
    osc.connect(gain);
    gain.connect(bus);
    osc.start();
    shepardOscillators.push(osc);
    shepardGains.push(gain);
  }
}

function _generateAscii(lines) {
  if (!asciiContainer) return;
  const glyphs = ' .:-=+*#%@&#$!?/\\|()⸸⛧🜏';
  let content = '';
  for (let i = 0; i < lines; i++) {
    let line = '';
    const width = 80;
    for (let j = 0; j < width; j++) {
      const val = Math.sin(i * 0.1) * Math.cos(j * 0.1) + Math.sin(scrollDist * 0.001);
      const idx = Math.floor(((val + 1) / 2) * glyphs.length);
      line += glyphs[idx % glyphs.length] || ' ';
    }
    content += line + '\n';
  }
  const div = document.createElement('div');
  div.textContent = content;
  asciiContainer.appendChild(div);
}

function onUpdate(engine, dt) {
  if (complete) return;
  const now = Date.now();
  const timeSinceLastScroll = (now - lastScrollTime) / 1000;

  if (timeSinceLastScroll < 2) {
    const isOasis = (scrollDist % 2000 < 200);
    const multiplier = isOasis ? 2.5 : 1.0;
    progress += dt * multiplier;
    engine.setRitualIntensity(0.002, isOasis ? 0.02 : 0.08);
    engine.setAnxiety(isOasis ? 0.1 : 0.4);
  } else {
    progress -= dt * 0.5;
  }

  if (progress < 0) progress = 0;
  
  const distEl = document.getElementById('l4-distance');
  if (distEl) {
    distEl.textContent = `${translate("ITERUM")}: ${(scrollDist / 1000).toFixed(3)}m | ${translate("NOMINA")}: ${Math.floor(progress)}/72`;
  }

  _updateShepardTone(dt);

  if (progress >= WIN_PROGRESS) {
    complete = true;
    _onComplete();
  }
}

function _updateShepardTone(dt) {
  shepardOscillators.forEach((osc, i) => {
    let freq = osc.frequency.value;
    freq *= (1 + 0.1 * dt);
    if (freq > 2000) freq /= Math.pow(2, 6);
    osc.frequency.setTargetAtTime(freq, 0, 0.1);
    const logFreq = Math.log2(freq / 40);
    const volume = Math.max(0, 1 - Math.abs(logFreq - 3) / 3);
    shepardGains[i].gain.setTargetAtTime(volume * 0.1, 0, 0.1);
  });
}

function _onComplete() {
  const overlay = document.getElementById('l4-netzach');
  gsap.to(overlay, { 
    opacity: 0, 
    duration: 3, 
    onComplete: () => {
      if (onComplete) onComplete();
    }
  });
}

function onExit(engine) {
  window.removeEventListener('wheel', this._onScroll);
  shepardOscillators.forEach(osc => { try { osc.stop(); } catch(e){} });
  shepardGains.forEach(gain => gain.disconnect());
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
