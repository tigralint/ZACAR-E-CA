/**
 * ZACAR-E-CA · Phase III — HOD (The Splendor of Silence)
 * 
 * The terminal of reason. Authentication is required.
 */
import { gsap } from 'gsap';
import { translate } from '../core/enochian.js';

let timer = 0;
const WIN_TIME = 40;
let complete = false;
let terminalEl;
let progressEl;
let authenticated = false;
let lastActionTime = 0;

function onEnter(engine) {
  timer = 0;
  complete = false;
  authenticated = false;
  lastActionTime = Date.now();

  engine.audio.setDroneLevel(0.1);
  engine.audio.setWhisperLevel(0.02);

  engine.overlay.innerHTML = `
    <div id="l3-hod" style="
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: #050505;
      color: #00ff00;
      font-family: var(--font-mono);
      padding: 40px;
      overflow: hidden;
    ">
      <div id="l3-terminal" style="
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 600px;
        height: 400px;
        background: rgba(0, 20, 0, 0.9);
        border: 2px solid #00ff00;
        padding: 20px;
        box-shadow: 0 0 50px rgba(0, 255, 0, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: center;
      ">
        <div id="l3-header">${translate("CURIALIS")}: Identificatio requiritur.</div>
        <div id="l3-sub">${translate("TENEBRIS")}: Insere signum secretum...</div>
        <div style="margin-top: 10px;">
          > <input type="text" id="l3-pass" autocomplete="off" style="background:transparent; border:none; border-bottom:1px solid #00ff00; color:#00ff00; outline:none; font-family:inherit; width: 200px;">
        </div>
        <div id="l3-log" style="margin-top: 20px; font-size: 0.8rem; opacity: 0.7; height: 100px; overflow-y: auto;"></div>
        <div id="l3-progress-container" style="width: 100%; height: 2px; background: #003300; margin-top: auto; display: none;">
          <div id="l3-progress-bar" style="width: 0%; height: 100%; background: #00ff00;"></div>
        </div>
      </div>
    </div>
  `;

  terminalEl = document.getElementById('l3-terminal');
  const passInput = document.getElementById('l3-pass');
  const log = document.getElementById('l3-log');
  progressEl = document.getElementById('l3-progress-bar');
  const progressContainer = document.getElementById('l3-progress-container');

  passInput.focus();
  passInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = passInput.value.trim().toUpperCase();
      if (val === 'ABSCONDITUS') {
        authenticated = true;
        passInput.style.display = 'none';
        document.getElementById('l3-header').innerText = translate("AUTHENTICATED");
        document.getElementById('l3-sub').innerText = translate("STAY STILL");
        progressContainer.style.display = 'block';
        lastActionTime = Date.now();
        log.innerHTML += `> ${translate("ACCESS GRANTED")}...<br>`;
      } else {
        log.innerHTML += `> <span style="color:red;">${translate("INVALID")}</span>...<br>`;
        _triggerGlitch(engine);
      }
      passInput.value = '';
    }
  });

  this._onInput = (e) => {
    if (!authenticated || complete) return;
    timer = 0;
    _triggerGlitch(engine);
  };

  window.addEventListener('keydown', this._onInput);
  window.addEventListener('mousemove', this._onInput);
}

function _triggerGlitch(engine) {
  gsap.fromTo(terminalEl, 
    { x: '+=5', y: '+=5' }, 
    { x: '-=10', y: '-=10', duration: 0.05, repeat: 5, yoyo: true, onComplete: () => {
      terminalEl.style.transform = 'translate(-50%, -50%)';
    }}
  );
  engine.setAnxiety(0.8);
  setTimeout(() => engine.setAnxiety(0), 200);
}

function onUpdate(engine, dt) {
  if (!authenticated || complete) return;

  timer += dt;
  const progressPercent = (timer / WIN_TIME) * 100;
  
  if (progressEl) {
    progressEl.style.width = `${Math.min(100, progressPercent)}%`;
  }

  if (timer >= WIN_TIME) {
    complete = true;
    _onFinalized();
  }
}

function _onFinalized() {
  const log = document.getElementById('l3-log');
  if (log) log.innerHTML += `<br><span style="color:white;">${translate("ACCEPTED")}</span>`;
  
  gsap.to(terminalEl, { 
    scale: 0, 
    opacity: 0, 
    duration: 1.5, 
    delay: 1, 
    onComplete: () => {
      if (onComplete) onComplete();
    }
  });
}

function onExit(engine) {
  window.removeEventListener('keydown', this._onInput);
  window.removeEventListener('mousemove', this._onInput);
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
