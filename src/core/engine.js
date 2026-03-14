/**
 * ZACAR-E-CA · Engine
 * 
 * Master orchestrator. Initializes all subsystems, runs the main loop,
 * and provides the shared API surface to all levels.
 */

import * as THREE from 'three';
import { ZalgoSystem } from './zalgo.js';
import { AudioEngine } from './audio-engine.js';
import { StateManager } from './state-manager.js';
import { Renderer } from './renderer.js';

export class Engine {
  constructor() {
    this.zalgo = new ZalgoSystem();
    this.audio = new AudioEngine();
    this.state = new StateManager();
    this.renderer = null;

    this._running = false;
    this._lastTime = 0;

    // Shared references levels can use
    this.overlay = document.getElementById('ui-overlay');
    this.cursor = null;
  }

  /**
   * Initialize all systems. Must be called from a user gesture handler.
   */
  async init() {
    // Canvas
    const canvas = document.getElementById('void');
    this.renderer = new Renderer(canvas);

    // Audio (requires user gesture)
    await this.audio.init();

    // Zalgo title corruption
    this.zalgo.start();

    // Custom cursor
    this._createCursor();

    // CRT noise overlay
    this._createNoiseOverlay();

    // Initialize Subtle Terror System
    this._initSubtleTerror();

    // Scanlines
    document.body.classList.add('scanlines');

    // Start render loop
    this._running = true;
    this._lastTime = performance.now();
    this._loop(this._lastTime);

    // Start Level 1
    await this.state.transitionTo(1, this);
  }
  /**
   * Initialize the Subtle Terror System.
   */
  _initSubtleTerror() {
    this.watchers = [];
    this.terrorLevel = 0;
    this.lastFlash = 0;

    // Silhouette geometries
    this.watcherGeo = new THREE.PlaneGeometry(2, 4);
    this.watcherMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
  }

  _spawnWatcher(scene, camera) {
    if (!scene || !camera) return;
    
    const watcher = new THREE.Mesh(this.watcherGeo, this.watcherMat.clone());
    
    const distance = 15 + Math.random() * 20;
    const angle = (Math.random() - 0.5) * Math.PI * 0.5;
    
    const side = Math.random() > 0.5 ? 1 : -1;
    const offset = (0.5 + Math.random() * 0.5) * side; 

    watcher.position.set(offset * distance, (Math.random() - 0.5) * 5, -distance);
    watcher.position.applyQuaternion(camera.quaternion);
    watcher.lookAt(camera.position);
    
    scene.add(watcher);
    this.watchers.push({ 
      mesh: watcher, 
      birth: Date.now(),
      life: 2000 + Math.random() * 3000
    });
  }

  _updateSubtleTerror(dt) {
    const now = Date.now();
    const maxWatchers = Math.min(10, (this.state.sealsBroken || 1) * 2);
    
    if (this.watchers.length < maxWatchers && Math.random() < 0.01) {
        const level = this.state.levelInstance;
        if (level && level.scene && level.camera) {
            this._spawnWatcher(level.scene, level.camera);
        }
    }

    this.watchers = this.watchers.filter(w => {
        const age = now - w.birth;
        if (age > w.life) {
            if (w.mesh.parent) w.mesh.parent.remove(w.mesh);
            return false;
        }
        w.mesh.material.opacity = (0.3 + Math.random() * 0.2) * (1 - age / w.life);
        return true;
    });

    const pulse = Math.sin(now * 0.001) * 0.1;
    this.setAnxiety(this.terrorLevel + pulse);

    if (this.renderer) {
        this.renderer.updateUniforms({ seal: this.state.sealsBroken });
    }
  }

  _spawnEnochianSolid(scene) {
    const geometries = [
        new THREE.TetrahedronGeometry(1),
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.OctahedronGeometry(1),
        new THREE.DodecahedronGeometry(1),
        new THREE.IcosahedronGeometry(1)
    ];
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const mat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
    );
    scene.add(mesh);
    return mesh;
  }

  _createCursor() {
    this.cursor = document.createElement('div');
    this.cursor.id = 'custom-cursor';
    document.body.appendChild(this.cursor);

    this._cursorX = 0;
    this._cursorY = 0;
    this._cursorTargetX = 0;
    this._cursorTargetY = 0;
    this._cursorLag = 0.15;

    window.addEventListener('mousemove', (e) => {
      if (this._overrideCursor) return;
      this._cursorTargetX = e.clientX;
      this._cursorTargetY = e.clientY;
    });
  }

  setOverrideCursor(val) {
    this._overrideCursor = val;
  }

  setCursorTarget(x, y) {
    this._cursorTargetX = x;
    this._cursorTargetY = y;
  }

  _createNoiseOverlay() {
    const noise = document.createElement('div');
    noise.id = 'noise-overlay';
    document.body.appendChild(noise);
  }

  setAnxiety(level) {
      if (this.audio) this.audio.setAnxiety(level);
      this.terrorLevel = level;
  }

  setRitualIntensity(abberation, grain) {
      if (this.renderer) {
          this.renderer.updateUniforms({ abberation, grain });
      }
  }

  setCursorLag(factor) {
    this._cursorLag = Math.max(0.001, Math.min(0.5, factor));
  }

  _loop(time) {
    if (!this._running) return;

    const dt = (time - this._lastTime) / 1000;
    this._lastTime = time;

    this._cursorX += (this._cursorTargetX - this._cursorX) * this._cursorLag;
    this._cursorY += (this._cursorTargetY - this._cursorY) * this._cursorLag;
    if (this.cursor) {
      this.cursor.style.transform = `translate(${this._cursorX - 6}px, ${this._cursorY - 6}px)`;
    }

    this._updateSubtleTerror(dt);
    if (this.state.update) this.state.update(this, dt);
    if (this.renderer) this.renderer.render();

    requestAnimationFrame((t) => this._loop(t));
  }

  destroy() {
    this._running = false;
    this.zalgo.stop();
    this.audio.destroy();
    if (this.renderer) this.renderer.destroy();
  }
}
