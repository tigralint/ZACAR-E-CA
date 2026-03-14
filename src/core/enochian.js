/**
 * ZACAR-E-CA · Aetheris Kernel — Log Utility
 * 
 * Generates cryptic, hostile, and theological system logs for the Aetheris OS.
 * Used to provide hints and atmosphere via the Browser Console.
 */

const KERNEL_PREFIX = "[AETHERIS_KERNEL]";

const ERROR_CODES = [
  "0x8007: SOUL_WEIGHT_MISMATCH",
  "0x4A66: DEMONIC_INTERFERENCE_IN_MEMORY_BLOCK",
  "0x0001: MALKUTH_GRAVITY_OVERFLOW",
  "0x0999: ABYSS_VOID_PTR_EXPOSED",
  "0xDEAD: ENTITY_EGO_CORRUPTION",
  "0xFFFF: APOCALYPSE_OVERFLOW_ERROR"
];

const LITURGY_SNIPPETS = [
  "OD ZODAMETA · OD CHRISTEOS · OL GIZYAX",
  "ADAREPANU EGO · IAD GIGIPA",
  "MICMA VOHIM · SIGILLUM BREAKS",
  "SOLVE ET COAGULA",
  "NON NOBIS DOMINE · SED NOMINI TUO DA GLORIAM"
];

const KERNEL_ALERTS = [
  "EMERGENCY PURGE REQUIRED",
  "UNAUTHORIZED SOUL ACCESS DETECTED",
  "RECALIBRATING SIN_RATIO...",
  "VESSEL INTEGRITY: 4% (CRITICAL)",
  "SYNCHRONIZING WITH SEVENTH SEAL"
];

/**
 * Returns a formatted kernel log.
 */
export function getKernelPanic() {
  const code = ERROR_CODES[Math.floor(Math.random() * ERROR_CODES.length)];
  const alert = KERNEL_ALERTS[Math.floor(Math.random() * KERNEL_ALERTS.length)];
  return `${KERNEL_PREFIX} FATAL: ${code} // ${alert}`;
}

/**
 * Higher-order translation for UI elements (if any remain).
 * Now strictly translates to Enochian or remains hostile.
 */
export function translate(text) {
  // Mostly return Enochian or symbols to keep it hostile
  const symbols = ["⸸", "⛧", "🜏", "🜓", "☉", "☽"];
  const s = symbols[Math.floor(Math.random() * symbols.length)];
  return `${s} ${text.toUpperCase().split('').reverse().join('')} ${s}`;
}

/**
 * Returns a liturgy line.
 */
export function getLiturgy() {
  return LITURGY_SNIPPETS[Math.floor(Math.random() * LITURGY_SNIPPETS.length)];
}

/**
 * Specifically for the Developer Console.
 */
export function logAetheris(type = 'error', message = null) {
  const msg = message || getKernelPanic();
  const styles = {
    error: 'color: #ff0000; font-weight: bold; background: #1a0000; padding: 2px 5px; border: 1px solid red;',
    warn: 'color: #ffd700; font-style: italic; background: #1a1a00; padding: 2px 5px;',
    liturgy: 'color: #d4c5a9; font-family: serif; text-shadow: 0 0 5px red;'
  };

  if (type === 'liturgy') {
    console.log(`%c⸸ ${getLiturgy()} ⸸`, styles.liturgy);
  } else if (console[type]) {
    console[type](`%c${msg}`, styles[type]);
  }
}
