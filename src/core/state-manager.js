/**
 * ZACAR-E-CA · State Manager
 * 
 * Finite State Machine for the 10 Gates (levels).
 * Each level is a module conforming to the interface:
 * {
 *   onEnter(engine)    — called when entering the level
 *   onUpdate(engine, dt) — called every frame
 *   onExit(engine)     — called when leaving the level
 *   onComplete         — callback set by StateManager, level calls it to advance
 * }
 * 
 * Levels are lazy-loaded via dynamic import() for code splitting.
 */

const LEVEL_MODULES = {
  1: () => import('../levels/level1-malkuth.js'),
  2: () => import('../levels/level2-yesod.js'),
  3: () => import('../levels/level3-hod.js'),
  4: () => import('../levels/level4-netzach.js'),
  5: () => import('../levels/level5-gevurah.js'),
  6: () => import('../levels/level6-tiferet.js'),
  7: () => import('../levels/level7-chesed.js'),
  8: () => import('../levels/level8-binah.js'),
  9: () => import('../levels/level9-chokmah.js'),
  10: () => import('../levels/level10-keter.js'),
};

import { translate, getLiturgy } from './enochian.js';

export class StateManager {
  constructor() {
    this.currentLevel = 0;  // 0 = gate, 1-10 = levels
    this.levelInstance = null;
    this.sealsBroken = 0;
    this._transitioning = false;
    this._listeners = new Map();
  }

  /**
   * Subscribe to state change events.
   * @param {'enter'|'exit'|'complete'} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(callback);
  }

  _emit(event, data) {
    const cbs = this._listeners.get(event) || [];
    cbs.forEach(cb => cb(data));
  }

  /**
   * Transition to a specific level.
   * @param {number} level - Level number (1-10)
   * @param {object} engine - Reference to the engine
   */
  async transitionTo(level, engine) {
    if (this._transitioning) return;
    if (level < 1 || level > 10) return;
    this._transitioning = true;

    // Exit current level
    if (this._activeModule) {
      await this._activeModule.onExit(engine);
      this._emit('exit', { level: this.currentLevel });
      this._activeModule = null;
    }

    // Load new level
    const loader = LEVEL_MODULES[level];
    if (!loader) {
      console.error(`[ZACAR] Level ${level} not found`);
      this._transitioning = false;
      return;
    }

    try {
      const module = await loader();
      this.currentLevel = level;
      this._activeModule = module.default || module;

      // Provide the completion callback
      this._activeModule.onComplete = () => {
        this._advanceLevel(engine);
      };

      // Liturgy of the Machine
      console.log(`%c⸸ ${getLiturgy()} ⸸`, 'color: #8b0000; font-style: italic;');
      if (level > this.sealsBroken) this.sealsBroken = level;

      await this._activeModule.onEnter(engine);
      this._emit('enter', { level });
    } catch (err) {
      console.error(`[ZACAR] Failed to load level ${level}:`, err);
    }

    this._transitioning = false;
  }

  /**
   * Called every frame from the main render loop.
   */
  update(engine, dt) {
    if (this._activeModule && this._activeModule.onUpdate) {
      this._activeModule.onUpdate(engine, dt);
    }
  }

  /**
   * Advance to the next level.
   */
  async _advanceLevel(engine) {
    const next = this.currentLevel + 1;
    if (next > 10) {
      this._emit('complete', { level: 10 });
      return;
    }
    await this.transitionTo(next, engine);
  }

  /**
   * Get current level number.
   */
  getLevel() {
    return this.currentLevel;
  }
}
