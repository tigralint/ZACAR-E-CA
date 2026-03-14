/**
 * ZACAR-E-CA · Enochian Transcription Utility
 * 
 * Replaces human language with the "Angelic" script of the Aetheris Kernel.
 * Used for UI, console messages, and secrets.
 */

const ENOCHIAN_MAP = {
  // Common terms
  "MOVE": "ZACAR",
  "AND": "OD",
  "EARTHQUAKE": "GIZYAX",
  "LET THERE BE": "CHRISTEOS",
  "TO THE END": "ZODAMETA",
  "GLORY": "ADAREPANU",
  "GOD": "IAD",
  "SPIRIT": "GIGIPA",
  "OPEN": "DOOIAP",
  "FOUNDATION": "YESOD", // Cross-pollination with Kabbalah
  "BEHOLD": "MICMA",
  "SILENCE": "HOD",
  "FIRE": "PRAGE",
  "WATER": "ZODLIDA",
  "THE VOID": "VRELP",
  "INITIATE": "VOHIM",
  "SEAL": "SIGILLUM",
  "WITNESS": "BAMANO",
  
  // Levels
  "MALKUTH": "AMMA",
  "YESOD": "YESOD",
  "HOD": "HOD",
  "NETZACH": "NETZACH",
  "GEVURAH": "GEVURAH",
  "TIFERET": "TIFERET",
  "NETZACH": "NETZACH",
  "HOD": "HOD",
  "YESOD": "YESOD",
  "MALKUTH": "MALKUTH",
  "CHOKMAH": "CHOKMAH",
  "BINAH": "BINAH",
  "KETER": "KETER"
};

const SYMBOLS = ["⸸", "⛧", "🜏", "🜓", "🜁", "🜂", "🜃", "🜄", "☉", "☽", "☿", "♀", "♂", "♃", "♄"];

/**
 * Translate simple English strings to Enochian-inspired strings.
 */
export function translate(text) {
  const upper = text.toUpperCase();
  if (ENOCHIAN_MAP[upper]) return ENOCHIAN_MAP[upper];
  
  // If no direct map, randomized corruption
  return upper.split(' ').map(word => {
    if (ENOCHIAN_MAP[word]) return ENOCHIAN_MAP[word];
    return corrupt(word);
  }).join(' · ');
}

/**
 * Corrupt text with occult symbols and zalgo-lite.
 */
function corrupt(text) {
  const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  return `${sym} ${text} ${sym}`;
}

/**
 * Get a "Liturgy" line for the console.
 */
export function getLiturgy() {
  const lines = [
    "OD ZODAMETA · OD CHRISTEOS · OL GIZYAX",
    "ADAREPANU EGO · IAD GIGIPA",
    "MICMA VOHIM · SIGILLUM BREAKS",
    "KYRIE ELEISON · BINARY RECONSTRUCTION",
    "144000 BITS · THE SEVENTH SEAL",
    "NON NOBIS DOMINE · SED NOMINI TUO DA GLORIAM",
    "SOLVE ET COAGULA · DIGITAL TRANSFORMATION"
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}
