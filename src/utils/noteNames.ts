export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function midiToNoteName(midi: number, useFlats = false): string {
  const pitchClass = (midi % 12 + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const noteName = useFlats ? NOTE_NAMES_FLAT[pitchClass] : NOTE_NAMES_SHARP[pitchClass];
  return `${noteName}${octave}`;
}

export function noteNameToMidi(noteName: string): number {
  const match = noteName.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
  if (!match) return 60; // default C4
  let [, pitchStr, octaveStr] = match;
  pitchStr = pitchStr.toUpperCase();
  if (pitchStr === "DB") pitchStr = "C#";
  if (pitchStr === "EB") pitchStr = "D#";
  if (pitchStr === "GB") pitchStr = "F#";
  if (pitchStr === "AB") pitchStr = "G#";
  if (pitchStr === "BB") pitchStr = "A#";

  const pitchIndex = NOTE_NAMES_SHARP.indexOf(pitchStr);
  const octave = parseInt(octaveStr, 10);
  if (pitchIndex === -1) return 60;
  return (octave + 1) * 12 + pitchIndex;
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
