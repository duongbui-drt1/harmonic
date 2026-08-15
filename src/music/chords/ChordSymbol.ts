import { SemanticChordSymbol, ChordQuality, Extension, Alteration, PitchClass } from "../types";

export const NOTE_NAMES_SHARP: PitchClass[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const NOTE_NAMES_FLAT: PitchClass[] = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export interface QualityDef {
  quality: ChordQuality;
  canonicalName: string;
  aliases: string[];
  intervals: number[]; // semitones from root
  formula: string;
}

export const QUALITY_DEFINITIONS: QualityDef[] = [
  { quality: "major", canonicalName: "", aliases: ["", "M", "maj", "major"], intervals: [0, 4, 7], formula: "1 - 3 - 5" },
  { quality: "minor", canonicalName: "m", aliases: ["m", "min", "-", "minor"], intervals: [0, 3, 7], formula: "1 - b3 - 5" },
  { quality: "dominant7", canonicalName: "7", aliases: ["7", "dom7"], intervals: [0, 4, 7, 10], formula: "1 - 3 - 5 - b7" },
  { quality: "major7", canonicalName: "maj7", aliases: ["maj7", "M7", "Δ7", "Δ"], intervals: [0, 4, 7, 11], formula: "1 - 3 - 5 - 7" },
  { quality: "minor7", canonicalName: "m7", aliases: ["m7", "min7", "-7"], intervals: [0, 3, 7, 10], formula: "1 - b3 - 5 - b7" },
  { quality: "diminished", canonicalName: "dim", aliases: ["dim", "°"], intervals: [0, 3, 6], formula: "1 - b3 - b5" },
  { quality: "diminished7", canonicalName: "dim7", aliases: ["dim7", "°7"], intervals: [0, 3, 6, 9], formula: "1 - b3 - b5 - bb7" },
  { quality: "halfDiminished7", canonicalName: "m7b5", aliases: ["m7b5", "ø", "m7(b5)", "half-dim"], intervals: [0, 3, 6, 10], formula: "1 - b3 - b5 - b7" },
  { quality: "augmented", canonicalName: "aug", aliases: ["aug", "+", "aug5"], intervals: [0, 4, 8], formula: "1 - 3 - #5" },
  { quality: "sus2", canonicalName: "sus2", aliases: ["sus2"], intervals: [0, 2, 7], formula: "1 - 2 - 5" },
  { quality: "sus4", canonicalName: "sus4", aliases: ["sus4", "sus"], intervals: [0, 5, 7], formula: "1 - 4 - 5" },
  { quality: "6", canonicalName: "6", aliases: ["6", "maj6"], intervals: [0, 4, 7, 9], formula: "1 - 3 - 5 - 6" },
  { quality: "minor6", canonicalName: "m6", aliases: ["m6", "min6"], intervals: [0, 3, 7, 9], formula: "1 - b3 - 5 - 6" },
  { quality: "add9", canonicalName: "add9", aliases: ["add9", "add2"], intervals: [0, 4, 7, 14], formula: "1 - 3 - 5 - 9" },
  { quality: "minorAdd9", canonicalName: "madd9", aliases: ["madd9"], intervals: [0, 3, 7, 14], formula: "1 - b3 - 5 - 9" },
  { quality: "dominant9", canonicalName: "9", aliases: ["9", "dom9"], intervals: [0, 4, 7, 10, 14], formula: "1 - 3 - 5 - b7 - 9" },
  { quality: "major9", canonicalName: "maj9", aliases: ["maj9", "M9"], intervals: [0, 4, 7, 11, 14], formula: "1 - 3 - 5 - 7 - 9" },
  { quality: "minor9", canonicalName: "m9", aliases: ["m9", "min9"], intervals: [0, 3, 7, 10, 14], formula: "1 - b3 - 5 - b7 - 9" },
  { quality: "dominant11", canonicalName: "11", aliases: ["11", "dom11"], intervals: [0, 4, 7, 10, 14, 17], formula: "1 - 3 - 5 - b7 - 9 - 11" },
  { quality: "minor11", canonicalName: "m11", aliases: ["m11", "min11"], intervals: [0, 3, 7, 10, 14, 17], formula: "1 - b3 - 5 - b7 - 9 - 11" },
  { quality: "major11", canonicalName: "maj11", aliases: ["maj11"], intervals: [0, 4, 7, 11, 14, 17], formula: "1 - 3 - 5 - 7 - 9 - 11" },
  { quality: "dominant13", canonicalName: "13", aliases: ["13", "dom13"], intervals: [0, 4, 7, 10, 14, 21], formula: "1 - 3 - 5 - b7 - 9 - 13" },
  { quality: "minor13", canonicalName: "m13", aliases: ["m13"], intervals: [0, 3, 7, 10, 14, 21], formula: "1 - b3 - 5 - b7 - 9 - 13" },
  { quality: "major13", canonicalName: "maj13", aliases: ["maj13"], intervals: [0, 4, 7, 11, 14, 21], formula: "1 - 3 - 5 - 7 - 9 - 13" },
  { quality: "alteredDominant", canonicalName: "7alt", aliases: ["7alt", "alt", "7b9", "7#9", "7b5", "7#5", "7b9b5", "7b9#5"], intervals: [0, 4, 6, 10, 13], formula: "1 - 3 - b5/b9/b13 - b7" },
  { quality: "susDominant", canonicalName: "7sus4", aliases: ["7sus4", "7sus", "9sus4", "13sus4"], intervals: [0, 5, 7, 10], formula: "1 - 4 - 5 - b7" },
  { quality: "power", canonicalName: "5", aliases: ["5"], intervals: [0, 7], formula: "1 - 5" }
];

export function pitchClassToMidiValue(pc: string): number {
  if (!pc || typeof pc !== "string") return 0;
  const clean = pc.trim();
  const match = clean.match(/^([A-Ga-g])([#bxX]*)/);
  if (!match) return 0;
  const letter = match[1].toUpperCase();
  const accidentals = match[2] || "";
  const baseMap: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const base = baseMap[letter] ?? 0;
  let offset = 0;
  for (const c of accidentals) {
    if (c === "#") offset += 1;
    else if (c === "b" || c === "B") offset -= 1;
    else if (c === "x" || c === "X") offset += 2;
  }
  return (((base + offset) % 12) + 12) % 12;
}

export function midiToPitchClass(midi: number, preferFlats = false): string {
  const pc = ((midi % 12) + 12) % 12;
  return preferFlats ? NOTE_NAMES_FLAT[pc] : NOTE_NAMES_SHARP[pc];
}

export function parseChordSymbolString(input: string): SemanticChordSymbol {
  const clean = input.trim().replace(/\s+/g, "");
  let mainPart = clean;
  let bassNote: string | undefined = undefined;

  if (clean.includes("/")) {
    const parts = clean.split("/");
    mainPart = parts[0];
    bassNote = parts[1];
  }

  const match = mainPart.match(/^([A-G][#b]?)(.*)$/i);
  if (!match) {
    return {
      root: "C",
      quality: "major",
      extensions: [],
      alterations: [],
      bass: bassNote,
      inversion: bassNote ? 1 : 0,
      fullName: input || "C",
    };
  }

  let root = match[1].charAt(0).toUpperCase() + (match[1].slice(1) === "b" ? "b" : match[1].slice(1) === "#" ? "#" : "");
  const suffix = match[2] || "";

  let matchedDef = QUALITY_DEFINITIONS.find((d) => d.aliases.includes(suffix));

  if (!matchedDef) {
    // Check altered suffix
    if (suffix.includes("alt") || suffix.includes("b9") || suffix.includes("#9") || suffix.includes("#11")) {
      matchedDef = QUALITY_DEFINITIONS.find((d) => d.quality === "alteredDominant");
    } else if (suffix.includes("sus")) {
      matchedDef = QUALITY_DEFINITIONS.find((d) => d.quality === "susDominant" || d.quality === "sus4");
    } else if (suffix.toLowerCase().startsWith("m") || suffix.startsWith("-")) {
      matchedDef = QUALITY_DEFINITIONS.find((d) => d.quality === "minor");
    } else {
      matchedDef = QUALITY_DEFINITIONS.find((d) => d.quality === "major");
    }
  }

  const quality = matchedDef ? matchedDef.quality : "major";
  const extensions: Extension[] = [];
  const alterations: Alteration[] = [];

  if (suffix.includes("9")) extensions.push("9");
  if (suffix.includes("11")) extensions.push("11");
  if (suffix.includes("13")) extensions.push("13");
  if (suffix.includes("b5")) alterations.push("b5");
  if (suffix.includes("#5")) alterations.push("#5");

  let inversion = 0;
  if (bassNote && bassNote !== root) {
    inversion = 1;
  }

  return {
    root,
    quality,
    extensions,
    alterations,
    bass: bassNote,
    inversion,
    fullName: input,
  };
}

export function formatChordSymbol(sym: SemanticChordSymbol): string {
  const def = QUALITY_DEFINITIONS.find((d) => d.quality === sym.quality);
  const canon = def ? def.canonicalName : "";
  let name = `${sym.root}${canon}`;
  if (sym.bass && sym.bass !== sym.root) {
    name += `/${sym.bass}`;
  }
  return name;
}

export function getChordMidiNotesFromSymbol(sym: SemanticChordSymbol, octave = 3): number[] {
  const def = QUALITY_DEFINITIONS.find((d) => d.quality === sym.quality) || QUALITY_DEFINITIONS[0];
  const rootMidi = (octave + 1) * 12 + pitchClassToMidiValue(sym.root);
  let midis = def.intervals.map((inv) => rootMidi + inv);

  if (sym.bass && sym.bass !== sym.root) {
    const bassMidi = (octave) * 12 + pitchClassToMidiValue(sym.bass);
    midis = [bassMidi, ...midis];
  }
  return Array.from(new Set(midis)).sort((a, b) => a - b);
}
