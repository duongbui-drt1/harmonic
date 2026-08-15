export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const PITCH_CLASS_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const BASE_NOTE_SEMITONES: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

export function midiToNoteName(midi: number, useFlats = false): string {
  const pitchClass = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const noteName = useFlats ? NOTE_NAMES_FLAT[pitchClass] : NOTE_NAMES_SHARP[pitchClass];
  return `${noteName}${octave}`;
}

export function noteNameToMidi(noteName: string): number {
  if (!noteName || typeof noteName !== "string") return 60;
  const clean = noteName.trim();
  const match = clean.match(/^([A-Ga-g])([#bxX]*)(-?\d+)?$/);
  if (!match) return 60; // default C4

  const letter = match[1].toUpperCase();
  const accidentals = match[2] || "";
  const octave = match[3] !== undefined ? parseInt(match[3], 10) : 4;

  const baseSemitones = BASE_NOTE_SEMITONES[letter];
  if (baseSemitones === undefined) return 60;

  let accidentalOffset = 0;
  for (const char of accidentals) {
    if (char === "#") accidentalOffset += 1;
    else if (char === "b" || char === "B") accidentalOffset -= 1;
    else if (char === "x" || char === "X") accidentalOffset += 2;
  }

  return (octave + 1) * 12 + baseSemitones + accidentalOffset;
}

export function noteToFrequency(note: string | number): number {
  const midi = typeof note === "number" ? note : noteNameToMidi(note);
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export const FREQUENCY_MAP: Record<string, number> = {};
for (let m = 0; m <= 127; m++) {
  FREQUENCY_MAP[midiToNoteName(m)] = noteToFrequency(m);
}

export function normalizeNoteName(note: string): string {
  const clean = note.trim();
  const match = clean.match(/^([A-G][#b]?)(.*)$/i);
  if (!match) return clean;
  let root = match[1];
  root = root.charAt(0).toUpperCase() + (root.slice(1) === 'b' ? 'b' : root.slice(1) === '#' ? '#' : '');
  return root + match[2];
}

export interface PianoKey {
  midi: number;
  noteName: string; // e.g. "C", "C#"
  fullName: string; // e.g. "C3"
  octave: number;
  isBlack: boolean;
}

export function generatePianoKeys(startMidi = 48, endMidi = 72): PianoKey[] {
  const keys: PianoKey[] = [];
  for (let m = startMidi; m <= endMidi; m++) {
    const pitchClass = (m % 12 + 12) % 12;
    const noteName = NOTE_NAMES_SHARP[pitchClass];
    const octave = Math.floor(m / 12) - 1;
    const isBlack = noteName.includes('#');
    keys.push({
      midi: m,
      noteName,
      fullName: `${noteName}${octave}`,
      octave,
      isBlack,
    });
  }
  return keys;
}
