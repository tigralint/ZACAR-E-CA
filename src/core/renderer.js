/**
 * ZACAR-E-CA · Renderer
 *
 * Three.js WebGLRenderer wrapper.
 * Manages a single renderer shared across all levels.
 * Each level mounts its own scene and camera.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.activeScene = null;
    this.activeCamera = null;

    // Post-processing setup
    this.composer = new EffectComposer(this.renderer);
    
    // Custom Ritual Shader (Grain + Chromatic Aberration)
    const RitualShader = {
      uniforms: {
        'tDiffuse': { value: null },
        'uTime': { value: 0 },
        'uResolution': { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        'uAbberation': { value: 0.002 },
        'uGrainIntensity': { value: 0.08 },
        'uSeal': { value: 0 }, // 0 to 10
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uAbberation;
        uniform float uGrainIntensity;
        uniform float uSeal;
        varying vec2 vUv;

        float random(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec2 uv = vUv;
          float corruption = uSeal * 0.1;
          
          // UV Corruption (Digital Contraction/Tzimtzum)
          if (corruption > 0.0) {
            uv.x += sin(uv.y * 10.0 + uTime) * 0.01 * corruption;
            uv.y += cos(uv.x * 10.0 + uTime) * 0.01 * corruption;
          }

          // Chromatic Aberration
          float shift = uAbberation + (corruption * 0.02);
          float r = texture2D(tDiffuse, uv + vec2(shift, 0.0)).r;
          float g = texture2D(tDiffuse, uv).g;
          float b = texture2D(tDiffuse, uv - vec2(shift, 0.0)).b;
          vec3 color = vec3(r, g, b);

          // Film Grain / Holy Light
          float noise = random(uv + fract(uTime));
          color += (noise - 0.5) * (uGrainIntensity + corruption * 0.2);

          // Vignette
          float dist = distance(uv, vec2(0.5));
          color *= smoothstep(0.9 - corruption * 0.3, 0.3, dist);

          gl_FragColor = vec4(color, 1.0);
        }
      `
    };

    this.ritualPass = new ShaderPass(RitualShader);
    this.composer.addPass(this.ritualPass);

    // Handle resize
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  /**
   * Set the active scene and camera for rendering.
   * Called by each level on enter.
   */
  setActive(scene, camera) {
    this.activeScene = scene;
    this.activeCamera = camera;

    // Remove existing RenderPass if any
    this.composer.passes = this.composer.passes.filter(p => !(p instanceof RenderPass));
    
    // Add new RenderPass for the active scene
    const renderPass = new RenderPass(scene, camera);
    this.composer.insertPass(renderPass, 0);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
  }

  /**
   * Clear active scene (called on level exit).
   */
  clearActive() {
    this.activeScene = null;
    this.activeCamera = null;
    this.renderer.clear();
  }

  /**
   * Render current frame. Called from main loop.
   */
  render() {
    if (this.activeScene && this.activeCamera) {
      this.ritualPass.uniforms.uTime.value += 0.01;
      this.composer.render();
    }
  }

  /**
   * Update shader uniforms.
   */
  updateUniforms(params) {
      if (params.abberation !== undefined) this.ritualPass.uniforms.uAbberation.value = params.abberation;
      if (params.grain !== undefined) this.ritualPass.uniforms.uGrainIntensity.value = params.grain;
      if (params.seal !== undefined) this.ritualPass.uniforms.uSeal.value = params.seal;
  }

  /**
   * Get the raw Three.js renderer (for levels needing post-processing, etc.)
   */
  getThreeRenderer() {
    return this.renderer;
  }

  /**
   * Get current canvas dimensions.
   */
  getSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.ritualPass.uniforms.uResolution.value.set(w, h);

    if (this.activeCamera instanceof THREE.PerspectiveCamera) {
      this.activeCamera.aspect = w / h;
      this.activeCamera.updateProjectionMatrix();
    }
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}
