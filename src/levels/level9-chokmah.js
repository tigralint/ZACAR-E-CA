/**
 * ZACAR-E-CA · Phase IX — CHOKMAH (The Wisdom of Form)
 * 
 * Chaos of Revelation. The hidden word in the storm.
 * Trial: Click the word 'FORGIVE' moving in the particle storm.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { translate } from '../core/enochian.js';

let scene, camera, instancedText;
const COUNT = 10000;
let complete = false;
let targetWord;
let elapsedTime = 0;

function onEnter(engine) {
  complete = false;
  elapsedTime = 0;

  engine.audio.setDroneLevel(0.8);
  engine.audio.setWhisperLevel(0.5);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 20;

  _createChaos();

  engine.renderer.setActive(scene, camera);

  engine.overlay.innerHTML = `
    <div id="l9-chaos" style="width:100%; height:100%; position:absolute;">
      <div style="position:fixed; top:10%; width:100%; text-align:center; font-family:var(--font-serif); font-size:4rem; color:var(--bone); opacity:0.1; pointer-events:none; z-index:100;">${translate("CHOKMAH")}</div>
      <div id="l9-target" style="
        position: absolute;
        width: 120px; height: 60px;
        color: white;
        font-family: var(--font-serif);
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        text-shadow: 0 0 20px white;
        z-index: 100;
        pointer-events: auto;
        letter-spacing: 0.1em;
      ">${translate("FORGIVE")}</div>
    </div>
  `;

  targetWord = document.getElementById('l9-target');
  targetWord.onclick = () => {
    if (complete) return;
    complete = true;
    _onComplete();
  };
}

function _createChaos() {
  const geometry = new THREE.PlaneGeometry(0.5, 0.1);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.5,
    side: THREE.DoubleSide
  });

  instancedText = new THREE.InstancedMesh(geometry, material, COUNT);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < COUNT; i++) {
    matrix.setPosition(
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 50
    );
    instancedText.setMatrixAt(i, matrix);
  }
  scene.add(instancedText);
}

function onUpdate(engine, dt) {
  if (complete) return;
  elapsedTime += dt;

  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const rotation = new THREE.Euler();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3(1, 1, 1);

  for (let i = 0; i < COUNT; i++) {
    instancedText.getMatrixAt(i, matrix);
    matrix.decompose(position, quaternion, scale);
    
    position.x += Math.sin(Date.now() * 0.001 + i) * 0.1;
    position.y += Math.cos(Date.now() * 0.002 + i) * 0.1;
    position.z += Math.sin(Date.now() * 0.0005 + i) * 0.5;

    if (position.z > 25) position.z = -50;
    
    rotation.set(0, 0, Date.now() * 0.005 + i);
    quaternion.setFromEuler(rotation);

    matrix.compose(position, quaternion, scale);
    instancedText.setMatrixAt(i, matrix);
  }
  instancedText.instanceMatrix.needsUpdate = true;

  if (targetWord) {
    const tx = 50 + Math.sin(elapsedTime * 1.2) * 35;
    const ty = 50 + Math.cos(elapsedTime * 0.8) * 35;
    targetWord.style.left = `${tx}vw`;
    targetWord.style.top = `${ty}vh`;
  }

  engine.setAnxiety(0.8);
  engine.setRitualIntensity(0.01 + Math.sin(elapsedTime * 5) * 0.01, 0.2);
}

function _onComplete() {
  gsap.to(instancedText.material, { opacity: 0, duration: 2 });
  gsap.to(targetWord, { scale: 10, opacity: 0, duration: 2, onComplete: () => {
    if (onComplete) onComplete();
  }});
}

function onExit(engine) {
  engine.overlay.innerHTML = '';
  scene.clear();
}

let onComplete = null;

export default {
  onEnter,
  onUpdate,
  onExit,
  set onComplete(cb) { onComplete = cb; },
  get onComplete() { return onComplete; },
};
