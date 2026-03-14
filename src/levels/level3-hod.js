/**
 * ZACAR-E-CA · Phase III — HOD (The Silent Surrender)
 * 
 * Hostile Terminal: Rejecting the user's mind.
 * Victory condition: Absolute stillness for 40 seconds.
 */

import { gsap } from 'gsap';
import { logAetheris, translate } from '../core/enochian.js';

let complete = false;
let timer = 0;
const WIN_TIME = 40;
let overlay;
let lastMoveTime = 0;

function onEnter(engine) {
  complete = false;
  timer = 0;
  lastMoveTime = Date.now();

  engine.audio.setDroneLevel(0.5);
  engine.audio.setWhisperLevel(0.6);

  engine.overlay.innerHTML = `
    <div id="l3-hod" style="
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: #110000;
      color: #ff0000;
      font-family: var(--font-mono);
      display: flex;
      flex-direction: column;
      padding: 40px;
    ">
      <div id="l3-terminal" style="font-size: 0.9rem; line-height: 1.4;">
        > AETHERIS_OS v.7.2.1 [HOD_NODE]<br>
        > AUTHENTICATING VESSEL...<br>
        > ERROR: MORTAL_MIND_DETECTION_OVERFLOW<br>
        > WAITING FOR SURRENDER...
      </div>
      <div id="l3-input-line" style="margin-top: 20px;">
        <span style="color: grey;">user@void:~$</span> <span id="l3-cursor" style="background: red;">&nbsp;</span>
      </div>
    </div>
  `;

  overlay = document.getElementById('l3-hod');
  
  this._onKeyDown = (e) => {
    _onPanic(engine);
  };
  this._onMouseMove = (e) => {
    if (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2) {
       _onPanic(engine);
    }
  };

  window.addEventListener('keydown', this._onKeyDown);
  window.addEventListener('mousemove', this._onMouseMove);

  logAetheris('error', "IDENTITY_LOCKOUT: Resistance is counter-productive. Abandon will.");
}

function _onPanic(engine) {
  if (complete) return;
  timer = 0;
  lastMoveTime = Date.now();
  
  // Flash red, screech
  gsap.fromTo(overlay, { background: 'red' }, { background: '#110000', duration: 0.5 });
  logAetheris('error', "MORTAL_MIND_REJECTED: Signal reset.");
  
  const terminal = document.getElementById('l3-terminal');
  if (terminal) {
    const p = document.createElement('div');
    p.style.color = 'white';
    p.innerText = `> ${translate("ACCESS_DENIED")}`;
    terminal.appendChild(p);
    if (terminal.childNodes.length > 20) terminal.removeChild(terminal.firstChild);
  }
}

function onUpdate(engine, dt) {
  if (complete) return;

  timer += dt;
  
  // Visual feedback: darkening the screen as they succeed
  const progress = Math.min(1.0, timer / WIN_TIME);
  if (overlay) {
    overlay.style.opacity = 1.0 - progress * 0.5;
  }

  if (timer >= WIN_TIME) {
    complete = true;
    _onComplete();
  }
}

function _onComplete() {
  logAetheris('liturgy');
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
  window.removeEventListener('mousemove', this._onMouseMove);
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
