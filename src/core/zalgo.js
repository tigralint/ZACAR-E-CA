/**
 * ZACAR-E-CA · Zalgo System
 * 
 * Corrupts the browser tab title with Zalgo combining characters.
 * Detects tab visibility changes to display "Я 👁️ В И Ж У 👁️ Т Е Б Я".
 */

// Zalgo combining character ranges
const ZALGO_UP = [];
const ZALGO_MID = [];
const ZALGO_DOWN = [];

// Populate combining character arrays
for (let i = 0x0300; i <= 0x036F; i++) ZALGO_UP.push(String.fromCharCode(i));
for (let i = 0x0489; i <= 0x0489; i++) ZALGO_MID.push(String.fromCharCode(i));
for (let i = 0x0316; i <= 0x0333; i++) ZALGO_DOWN.push(String.fromCharCode(i));
// Extra combining marks for maximum corruption
for (let i = 0x0340; i <= 0x0345; i++) ZALGO_MID.push(String.fromCharCode(i));

const BASE_TEXTS = [
  'ZACAR-E-CA',
  'FORGIVE ME',
  'MALKUTH',
  'ДВИЖЕНИЕ',
  'ОТКРОЙ',
  'KETHER',
  'KENOSIS',
  'OD ZODAMETA',
  'EXARP',
  'HCOMA',
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function zalgoify(text, intensity = 0.5) {
  let result = '';
  for (const char of text) {
    result += char;
    const upCount = Math.floor(Math.random() * 4 * intensity) + 1;
    const midCount = Math.floor(Math.random() * 2 * intensity);
    const downCount = Math.floor(Math.random() * 4 * intensity) + 1;
    for (let i = 0; i < upCount; i++) result += randomFrom(ZALGO_UP);
    for (let i = 0; i < midCount; i++) result += randomFrom(ZALGO_MID);
    for (let i = 0; i < downCount; i++) result += randomFrom(ZALGO_DOWN);
  }
  return result;
}

export class ZalgoSystem {
  constructor() {
    this._animId = null;
    this._isHidden = false;
    this._intensity = 0.5;
    this._running = false;

    this._onVisibilityChange = this._onVisibilityChange.bind(this);
  }

  start() {
    if (this._running) return;
    this._running = true;

    document.addEventListener('visibilitychange', this._onVisibilityChange);
    this._tick();
  }

  stop() {
    this._running = false;
    if (this._animId) {
      cancelAnimationFrame(this._animId);
      this._animId = null;
    }
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
  }

  setIntensity(value) {
    this._intensity = Math.max(0, Math.min(1, value));
  }

  _onVisibilityChange() {
    this._isHidden = document.hidden;
    if (this._isHidden) {
      document.title = 'V I G I L · S I L E · E T · V I D E';
    }
  }

  _tick() {
    if (!this._running) return;

    if (!this._isHidden) {
      const baseText = randomFrom(BASE_TEXTS);
      document.title = zalgoify(baseText, this._intensity);
    }

    // Vary mutation speed for unsettling irregularity
    const delay = 100 + Math.random() * 400;
    this._animId = setTimeout(() => {
      this._animId = requestAnimationFrame(() => this._tick());
    }, delay);
  }
}

// Utility export for use in levels
export { zalgoify };
