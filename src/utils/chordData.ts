import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT, noteNameToMidi, midiToNoteName } from "./noteNames";

export interface ChordDefinition {
  quality: string;
  aliases: string[];
  intervals: number[]; // relative semitones from root
  formula: string; // e.g., "1 - 3 - 5"
  functionDescription: string;
}

export const CHORD_DEFINITIONS: ChordDefinition[] = [
  {
    quality: "major",
    aliases: ["", "M", "maj"],
    intervals: [0, 4, 7],
    formula: "1 - 3 - 5",
    functionDescription: "Tonic / Rest. Warm, bright, stable, and happy quality.",
  },
  {
    quality: "minor",
    aliases: ["m", "min", "-"],
    intervals: [0, 3, 7],
    formula: "1 - b3 - 5",
    functionDescription: "Subdominant / Sad. Soft, somber, introspective quality.",
  },
  {
    quality: "7",
    aliases: ["7", "dom7"],
    intervals: [0, 4, 7, 10],
    formula: "1 - 3 - 5 - b7",
    functionDescription: "Dominant tension. Strong urge to resolve to tonic (I or i).",
  },
  {
    quality: "maj7",
    aliases: ["maj7", "M7", "Δ7", "Δ"],
    intervals: [0, 4, 7, 11],
    formula: "1 - 3 - 5 - 7",
    functionDescription: "Lush, dreamy, sophisticated major quality. Common in Jazz/Lo-Fi.",
  },
  {
    quality: "m7",
    aliases: ["m7", "min7", "-7"],
    intervals: [0, 3, 7, 10],
    formula: "1 - b3 - 5 - b7",
    functionDescription: "Smooth, contemplative minor quality. Essential in Jazz and Neo-Soul.",
  },
  {
    quality: "dim",
    aliases: ["dim", "°"],
    intervals: [0, 3, 6],
    formula: "1 - b3 - b5",
    functionDescription: "Tense, unstable diminished triad. Pulls inward to resolution.",
  },
  {
    quality: "dim7",
    aliases: ["dim7", "°7"],
    intervals: [0, 3, 6, 9],
    formula: "1 - b3 - b5 - bb7",
    functionDescription: "Highly dramatic, symmetrical tension chord. Pivots between keys.",
  },
  {
    quality: "m7b5",
    aliases: ["m7b5", "ø", "half-dim"],
    intervals: [0, 3, 6, 10],
    formula: "1 - b3 - b5 - b7",
    functionDescription: "Half-diminished chord. Standard ii° in minor key ii-V-i progressions.",
  },
  {
    quality: "aug",
    aliases: ["aug", "+", "aug5"],
    intervals: [0, 4, 8],
    formula: "1 - 3 - #5",
    functionDescription: "Suspended, dreamlike, outer-space tension pushing upward.",
  },
  {
    quality: "sus2",
    aliases: ["sus2"],
    intervals: [0, 2, 7],
    formula: "1 - 2 - 5",
    functionDescription: "Open, airy, modern ambiguity without a 3rd.",
  },
  {
    quality: "sus4",
    aliases: ["sus4", "sus"],
    intervals: [0, 5, 7],
    formula: "1 - 4 - 5",
    functionDescription: "Restless tension wanting to resolve downward to the 3rd.",
  },
  {
    quality: "add9",
    aliases: ["add9", "add2"],
    intervals: [0, 4, 7, 14],
    formula: "1 - 3 - 5 - 9",
    functionDescription: "Sparkling, expansive pop/acoustic color added to major triad.",
  },
  {
    quality: "madd9",
    aliases: ["madd9"],
    intervals: [0, 3, 7, 14],
    formula: "1 - b3 - 5 - 9",
    functionDescription: "Haunting, cinematic minor color.",
  },
  {
    quality: "9",
    aliases: ["9", "dom9"],
    intervals: [0, 4, 7, 10, 14],
    formula: "1 - 3 - 5 - b7 - 9",
    functionDescription: "Rich dominant chord with extended color. Funk and Blues staple.",
  },
  {
    quality: "maj9",
    aliases: ["maj9", "M9"],
    intervals: [0, 4, 7, 11, 14],
    formula: "1 - 3 - 5 - 7 - 9",
    functionDescription: "Extremely rich, warm Jazz and R&B major chord.",
  },
  {
    quality: "m9",
    aliases: ["m9", "min9"],
    intervals: [0, 3, 7, 10, 14],
    formula: "1 - b3 - 5 - b7 - 9",
    functionDescription: "Deep, moody, soulful minor chord.",
  },
  {
    quality: "6",
    aliases: ["6", "maj6"],
    intervals: [0, 4, 7, 9],
    formula: "1 - 3 - 5 - 6",
    functionDescription: "Sweet, vintage 1940s Swing and Bossa Nova major color.",
  },
  {
    quality: "m6",
    aliases: ["m6", "min6"],
    intervals: [0, 3, 7, 9],
    formula: "1 - b3 - 5 - 6",
    functionDescription: "Bittersweet, noir detective / Bossa Nova minor color.",
  }
];

export function parseChordName(input: string): { root: string; qualityDef: ChordDefinition; bass?: string } | null {
  const clean = input.trim().replace(/\s+/g, "");
  if (!clean) return null;

  // Check for slash chord e.g. C/E
  let mainChord = clean;
  let bassNote: string | undefined;
  if (clean.includes("/")) {
    const parts = clean.split("/");
    mainChord = parts[0];
    bassNote = parts[1];
  }

  const rootMatch = mainChord.match(/^([A-G][#b]?)(.*)$/i);
  if (!rootMatch) return null;

  let root = rootMatch[1];
  root = root.charAt(0).toUpperCase() + (root.slice(1) === "b" ? "b" : root.slice(1) === "#" ? "#" : "");
  const suffix = rootMatch[2] || "";

  // Find matching definition
  for (const def of CHORD_DEFINITIONS) {
    if (def.aliases.includes(suffix)) {
      return { root, qualityDef: def, bass: bassNote };
    }
  }

  // Fallback: try case-insensitive or default to major if suffix is empty
  if (suffix === "") {
    return { root, qualityDef: CHORD_DEFINITIONS[0], bass: bassNote };
  }

  return null;
}

export function getChordNotes(root: string, intervals: number[], baseOctave = 3): { noteNames: string[]; midiNotes: number[] } {
  // Find root pitch class
  let rootPitch = NOTE_NAMES_SHARP.indexOf(root);
  if (rootPitch === -1) {
    rootPitch = NOTE_NAMES_FLAT.indexOf(root);
  }
  if (rootPitch === -1) rootPitch = 0;

  const rootMidi = (baseOctave + 1) * 12 + rootPitch;
  const useFlats = root.includes("b") || ["F", "Bb", "Eb", "Ab", "Db"].includes(root);

  const midiNotes = intervals.map((inv) => rootMidi + inv);
  const noteNames = midiNotes.map((m) => midiToNoteName(m, useFlats));

  return { noteNames, midiNotes };
}

export function getPianoVoicing(root: string, intervals: number[]): { noteNames: string[]; midiNotes: number[] } {
  // Voicing logic:
  // Root in left hand octave (e.g. C3 = 48), upper extensions in octave 4
  const { midiNotes: rawMidis } = getChordNotes(root, intervals, 3);
  // Spread bass note C3, rest around C4/E4
  const bassMidi = rawMidis[0];
  const upperMidis = rawMidis.slice(1).map(m => (m < 60 ? m + 12 : m));
  const fullMidis = [bassMidi, ...upperMidis];

  const useFlats = root.includes("b") || ["F", "Bb", "Eb", "Ab", "Db"].includes(root);
  const noteNames = fullMidis.map(m => midiToNoteName(m, useFlats));

  return { noteNames, midiNotes: fullMidis };
}
