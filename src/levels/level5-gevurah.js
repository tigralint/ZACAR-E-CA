/**
 * ZACAR-E-CA · Phase V — GEVURAH (The Judgment of Fire)
 * 
 * The strobe of the Ophanim. The initiate's mortal coil is stripped.
 * Trial: Hold [SPACE] to endure the gaze of the wheels.
 */

import { gsap } from 'gsap';
import { translate } from '../core/enochian.js';

let timer = 0;
const DURATION = 30;
let complete = false;
let isHoldingSpace = false;
let overlay, angleContainer;

function onEnter(engine) {
  timer = 0;
  complete = false;
  isHoldingSpace = false;

  engine.audio.setDroneLevel(0.6);
  engine.audio.setWhisperLevel(0.2);

  const infoLines = [
    `${translate("USER AGENT")}: ${navigator.userAgent.substring(0, 30)}...`,
    `${translate("LOCUS")}: ${window.location.origin}`,
    `${translate("ID")}: 0x${(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}`,
    `${translate("STATUS")}: ${translate("CAPTURED")}`,
    `${translate("VERITAS")}: ${translate("INEVITABILIS")}`
  ];

  engine.overlay.innerHTML = `
    <div id="l5-gevurah" style="
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    ">
      <div id="l5-strobe" style="position:fixed; top:0; left:0; width:100%; height:100%; background:red; z-index:-1; opacity:0;"></div>
      
      <div id="l5-dox" style="
        font-family: var(--font-mono);
        color: var(--bone);
        font-size: 0.7rem;
        border: 1px solid var(--blood);
        padding: 20px;
        background: rgba(139, 0, 0, 0.1);
        z-index: 10;
        text-align: center;
      ">
        <div style="color:red; font-weight:bold; margin-bottom: 10px;">[ ${translate("IUDICIUM")} ]</div>
        ${infoLines.join('<br>')}
      </div>

      <div id="l5-title" style="position:fixed; top:10%; width:100%; text-align:center; font-family:var(--font-serif); font-size:4rem; color:var(--blood); pointer-events:none; z-index:100;">${translate("GEVURAH")}</div>
      <div id="l5-ophanim" style="position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none;"></div>

      <div id="l5-hint" style="
        margin-top: 50px;
        font-family: var(--font-serif);
        font-size: 1.5rem;
        color: var(--blood);
        animation: pulse 1s infinite;
      ">⸸ ${translate("TENE SPATIUM")} ⸸</div>

      <div id="l5-progress" style="margin-top:20px; width:200px; height:2px; background:#333;">
        <div id="l5-bar" style="height:100%; width:0%; background:red;"></div>
      </div>
    </div>
  `;

  overlay = document.getElementById('l5-gevurah');
  angleContainer = document.getElementById('l5-ophanim');

  this._onKeyDown = (e) => {
    if (e.code === 'Space') isHoldingSpace = true;
  };
  this._onKeyUp = (e) => {
    if (e.code === 'Space') isHoldingSpace = false;
  };

  window.addEventListener('keydown', this._onKeyDown);
  window.addEventListener('keyup', this._onKeyUp);

  for(let i=0; i<5; i++) _spawnOphanim();
}

function _spawnOphanim() {
  const div = document.createElement('div');
  div.style.cssText = `
    position: absolute;
    width: 200px;
    height: 200px;
    border: 4px double red;
    border-radius: 50%;
    left: ${Math.random() * 100}%;
    top: ${Math.random() * 100}%;
    opacity: 0.3;
    animation: rotate ${1 + Math.random() * 2}s linear infinite;
  `;
  const ring2 = div.cloneNode();
  ring2.style.width = '150px';
  ring2.style.height = '150px';
  ring2.style.animationDirection = 'reverse';
  div.appendChild(ring2);
  angleContainer.appendChild(div);
}

function onUpdate(engine, dt) {
  if (complete) return;
  const strobe = document.getElementById('l5-strobe');
  if (strobe) {
    strobe.style.opacity = (Math.random() > 0.8) ? (isHoldingSpace ? 0.3 : 1) : 0;
  }

  if (isHoldingSpace) {
    timer += dt;
    gsap.to(overlay, { 
      x: (Math.random() - 0.5) * 10, 
      y: (Math.random() - 0.5) * 10, 
      duration: 0.05 
    });
  } else {
    timer -= dt * 2;
    if (timer < 0) timer = 0;
    gsap.set(overlay, { x: 0, y: 0 });
  }

  const bar = document.getElementById('l5-bar');
  if (bar) bar.style.width = `${(timer / DURATION) * 100}%`;

  if (timer >= DURATION) {
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
  window.removeEventListener('keydown', this._onKeyDown);
  window.removeEventListener('keyup', this._onKeyUp);
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
