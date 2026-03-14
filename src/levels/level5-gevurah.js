/**
 * ZACAR-E-CA · Phase V — GEVURAH (The Judgment of Fire)
 * 
 * Raymarching Ophanim Shader. 
 * Hostile OS mode: Direct visual pressure, no instructions.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { logAetheris } from '../core/enochian.js';

let scene, camera, mesh, material;
let timer = 0;
const DURATION = 30;
let complete = false;
let isHoldingSpace = false;
let timeScale = 1.0;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float sdTorus( vec3 p, vec2 t ) {
    vec2 q = vec2(length(p.xz)-t.x,p.y);
    return length(q)-t.y;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.y, uResolution.x);
    vec3 ro = vec3(0.0, 0.0, 5.0);
    vec3 rd = normalize(vec3(uv, -1.0));
    
    float t = 0.0;
    float d = 0.0;
    vec3 p;
    
    for(int i = 0; i < 64; i++) {
      p = ro + rd * t;
      float d1 = sdTorus(p, vec2(1.5, 0.02));
      
      // Rotating inner rings
      mat3 rotX = mat3(1, 0, 0, 0, cos(uTime), -sin(uTime), 0, sin(uTime), cos(uTime));
      mat3 rotY = mat3(cos(uTime*1.5), 0, sin(uTime*1.5), 0, 1, 0, -sin(uTime*1.5), 0, cos(uTime*1.5));
      float d2 = sdTorus(rotX * rotY * p, vec2(1.2, 0.015));
      float d3 = sdTorus(rotY * rotX * p, vec2(0.9, 0.01));
      
      d = min(d1, min(d2, d3));
      if(d < 0.001 || t > 10.0) break;
      t += d;
    }

    vec3 col = vec3(0.0);
    if(t < 10.0) {
      float glow = exp(-d * 10.0) * uIntensity;
      col = vec3(1.0, 0.2, 0.0) * glow;
      col += vec3(1.0, 0.8, 0.0) * pow(glow, 2.0);
    }
    
    // Noise/Flicker
    col *= 0.8 + 0.2 * sin(uTime * 100.0);
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

function onEnter(engine) {
  complete = false;
  timer = 0;
  isHoldingSpace = false;
  timeScale = 1.0;

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1.0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    }
  });

  mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  engine.renderer.setActive(scene, camera);
  engine.overlay.innerHTML = ''; // Kill friendly UI

  this._onKeyDown = (e) => {
    if (e.code === 'Space') isHoldingSpace = true;
  };
  this._onKeyUp = (e) => {
    if (e.code === 'Space') isHoldingSpace = false;
  };

  window.addEventListener('keydown', this._onKeyDown);
  window.addEventListener('keyup', this._onKeyUp);

  logAetheris('warn', "CORE_VOLTAGE_SPIKE: Ophanim detection failure. Stabilize ritual via SPACE bypass.");
}

function onUpdate(engine, dt) {
  if (complete) return;

  if (isHoldingSpace) {
    timeScale = gsap.utils.interpolate(timeScale, 10.0, 0.1);
    timer += dt;
    engine.audio.setDroneLevel(0.8);
    engine.audio.setAnxiety(0.9);
    engine.setRitualIntensity(0.1, 0.5);
  } else {
    timeScale = gsap.utils.interpolate(timeScale, 1.0, 0.05);
    timer -= dt * 0.5;
    if (timer < 0) timer = 0;
    engine.audio.setDroneLevel(0.4);
    engine.audio.setAnxiety(0.3);
    engine.setRitualIntensity(0.01, 0.1);
  }

  material.uniforms.uTime.value += dt * timeScale;
  material.uniforms.uIntensity.value = 1.0 + (timer / DURATION) * 5.0;

  if (timer >= DURATION) {
    complete = true;
    _onComplete();
  }
}

function _onComplete() {
  logAetheris('liturgy');
  gsap.to(material.uniforms.uIntensity, { 
    value: 100, 
    duration: 2, 
    onComplete: () => {
      if (onComplete) onComplete();
    }
  });
}

function onExit(engine) {
  window.removeEventListener('keydown', this._onKeyDown);
  window.removeEventListener('keyup', this._onKeyUp);
  engine.overlay.innerHTML = '';
  if (mesh) {
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
}

let onComplete = null;

export default {
  onEnter,
  onUpdate,
  onExit,
  set onComplete(cb) { onComplete = cb; },
  get onComplete() { return onComplete; },
};
