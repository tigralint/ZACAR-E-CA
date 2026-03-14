/**
 * ZACAR-E-CA · Phase X — KETER (The Crown of Nothingness)
 * 
 * Kenosis. The final white-out.
 * "CONSUMMATUM EST"
 */
import { gsap } from 'gsap';
import { translate } from '../core/enochian.js';

let elapsedTime = 0;
let complete = false;

async function onEnter(engine) {
  elapsedTime = 0;
  complete = false;

  const whiteout = document.createElement('div');
  whiteout.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: white; z-index: 9999; opacity: 0;
  `;
  document.body.appendChild(whiteout);

  const liturgicalText = document.createElement('div');
  liturgicalText.style.cssText = `
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem; z-index: 10000;
    opacity: 0; pointer-events: none;
    text-align: center;
    font-family: var(--font-serif);
    color: #666;
  `;
  liturgicalText.innerHTML = `⸸ ${translate("CONSUMMATUM EST")} ⸸`;
  document.body.appendChild(liturgicalText);

  gsap.to(liturgicalText, {
      opacity: 0.8,
      duration: 6,
      onComplete: () => {
          gsap.to(liturgicalText, { opacity: 0, duration: 4, delay: 4 });
      }
  });

  gsap.to(whiteout, { 
    opacity: 1, 
    duration: 15, 
    ease: "power1.in",
    onComplete: () => {
      engine.setAnxiety(0);
      engine.zalgo.stop();
      document.title = 'S I L E N C E';
      engine.renderer.clearActive();
      engine.overlay.innerHTML = '';
      complete = true;
    }
  });

  engine.audio.setDroneLevel(0.1);
  engine.audio.setWhisperLevel(0);
}

function onUpdate(engine, dt) {
  elapsedTime += dt;
  if (!complete) {
    const prog = Math.min(1, elapsedTime / 15);
    engine.setAnxiety(1 - prog);
    engine.setRitualIntensity(0.002 * (1 - prog), 0.08 * (1 - prog));
  }
}

async function onExit(engine) {
  // There is no exit from Keter.
}

let onComplete = null;

export default {
  onEnter,
  onUpdate,
  onExit,
  set onComplete(cb) { onComplete = cb; },
  get onComplete() { return onComplete; },
};
