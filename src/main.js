/**
 * ZACAR-E-CA · Main Entry Point
 * 
 * Shows the gate, waits for user interaction (required for AudioContext),
 * then boots the engine and begins the descent.
 */

import './style.css';
import { Engine } from './core/engine.js';

const engine = new Engine();
window.engine = engine; // Debug shortcut

// The Gate — click to enter
const gate = document.getElementById('gate');

async function openGate() {
  gate.removeEventListener('click', openGate);
  gate.classList.add('opened');

  // Wait for CSS transition to complete
  await new Promise(resolve => setTimeout(resolve, 1500));
  gate.style.display = 'none';

  // Boot the engine (AudioContext requires user gesture — this click is it)
  await engine.init();
}

gate.addEventListener('click', openGate);

// Easter egg: if user opens DevTools console, they see this
console.log(
  '%c⸸ ZACAR-E-CA ⸸',
  'color: #8b0000; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px #ff0000;'
);
console.log(
  '%cOD ZODAMETA · OD CHRISTEOS · OL GIZYAX',
  'color: #d4c5a9; font-size: 12px; font-style: italic;'
);
console.log(
  '%c// You were not supposed to look here.',
  'color: #333; font-size: 10px;'
);
