/**
 * ZACAR-E-CA · Phase VIII — BINAH (The Mother of Silence)
 * 
 * Sonic Kenosis. The initiate must offer their voice, then withdraw it completely.
 * Trial: Absolute silence for 60 seconds.
 */

import { gsap } from 'gsap';
import { translate } from '../core/enochian.js';

let complete = false;
let timer = 0;
const WIN_TIME = 60;
let micStream = null;
let audioCtx = null;
let analyser = null;
let dataArray = null;
let overlay, pixel;
let hasPermission = false;

async function onEnter(engine) {
  complete = false;
  timer = 0;
  hasPermission = false;

  engine.audio.setDroneLevel(0);
  engine.audio.setWhisperLevel(0);

  engine.overlay.innerHTML = `
    <div id="l8-binah" style="
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
      <div id="l8-pixel" style="width:1px; height:1px; background:white; position:absolute;"></div>
      
      <div id="l8-status" style="
        font-family: var(--font-mono);
        color: var(--bone);
        font-size: 0.7rem;
        opacity: 0.2;
        margin-top: 100px;
        z-index: 10;
        text-align: center;
      ">
        [ ${translate("EXPECTATIO SILENTII")} ]<br>
        <span id="l8-timer">00:00</span>
      </div>

      <div id="l8-permission" style="
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--font-serif);
        font-size: 1.2rem;
        color: var(--bone);
        text-align: center;
        background: black;
        padding: 20px;
        border: 1px solid var(--ash);
        cursor: pointer;
        z-index: 100;
        letter-spacing: 0.2em;
      ">
        ⸸ ${translate("SINE UT TE AUDIAM")} ⸸<br>
        <span style="font-size: 0.7rem; font-family: var(--font-mono); opacity: 0.5;">(${translate("CLICK TO GRANT ACCESS")})</span>
      </div>
    </div>
  `;

  overlay = document.getElementById('l8-binah');
  pixel = document.getElementById('l8-pixel');
  const permBtn = document.getElementById('l8-permission');

  permBtn.onclick = async () => {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      hasPermission = true;
      permBtn.style.display = 'none';
    } catch (err) {
      permBtn.innerText = translate("ACCESS DENIED");
    }
  };
}

function onUpdate(engine, dt) {
  if (complete || !hasPermission) return;

  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
  const average = sum / dataArray.length; 

  if (average < 12) { 
    timer += dt;
  } else {
    if (timer > 1) _flashWarn();
    timer = 0;
  }

  const timerLabel = document.getElementById('l8-timer');
  if (timerLabel) {
    const s = Math.floor(timer);
    timerLabel.innerText = `00:${s.toString().padStart(2, '0')}`;
  }

  const pSize = Math.max(1, (timer / WIN_TIME) * 80);
  if (pixel) {
    pixel.style.width = `${pSize}px`;
    pixel.style.height = `${pSize}px`;
    pixel.style.boxShadow = `0 0 ${pSize * 2}px rgba(255,255,255,${timer / WIN_TIME})`;
  }

  if (timer >= WIN_TIME) {
    complete = true;
    _onComplete();
  }
}

function _flashWarn() {
  overlay.style.background = 'rgba(139,0,0,0.2)';
  setTimeout(() => { if(overlay) overlay.style.background = '#000'; }, 100);
}

function _onComplete() {
  gsap.to(pixel, { 
    scale: 500, 
    opacity: 0, 
    duration: 5, 
    onComplete: () => {
      if (onComplete) onComplete();
    }
  });
}

function onExit(engine) {
  if (micStream) micStream.getTracks().forEach(track => track.stop());
  if (audioCtx) audioCtx.close().catch(()=>{});
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
