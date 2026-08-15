import { ChordItem } from "../types";
import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT, midiToNoteName, noteNameToMidi } from "./noteNames";
import { parseChordName } from "./chordData";

/**
 * Transpose a chord name string by a given number of semitones
 */
export function transposeChordName(chordName: string, semitones: number): string {
  if (!chordName || semitones === 0) return chordName;
  const cleanName = chordName.trim();
  let mainChordStr = cleanName;
  let bassStr: string | undefined;

  if (cleanName.includes("/")) {
    const parts = cleanName.split("/");
    mainChordStr = parts[0];
    bassStr = parts[1];
  }

  const rootMatch = mainChordStr.match(/^([A-G][#b]?)(.*)$/i);
  if (!rootMatch) return cleanName;

  const rawRoot = rootMatch[1];
  const suffix = rootMatch[2] || "";

  // Determine root pitch index (0 to 11)
  const rootMidi = noteNameToMidi(`${rawRoot}4`);
  const rootPitchClass = ((rootMidi % 12) + 12) % 12;
  const newRootPitchClass = ((rootPitchClass + semitones) % 12 + 12) % 12;

  // Use flats if semitones < 0 or original root had a flat, otherwise sharps
  const preferFlats = semitones < 0 || rawRoot.includes("b") || ["F", "Bb", "Eb", "Ab", "Db"].includes(rawRoot);
  const newRoot = preferFlats ? NOTE_NAMES_FLAT[newRootPitchClass] : NOTE_NAMES_SHARP[newRootPitchClass];

  let newBassStr = "";
  if (bassStr) {
    const bassMatch = bassStr.match(/^([A-G][#b]?)(.*)$/i);
    if (bassMatch) {
      const bassMidi = noteNameToMidi(`${bassMatch[1]}4`);
      const bassPitchClass = ((bassMidi % 12) + 12) % 12;
      const newBassPitchClass = ((bassPitchClass + semitones) % 12 + 12) % 12;
      const newBassRoot = preferFlats ? NOTE_NAMES_FLAT[newBassPitchClass] : NOTE_NAMES_SHARP[newBassPitchClass];
      newBassStr = `/${newBassRoot}${bassMatch[2] || ""}`;
    } else {
      newBassStr = `/${bassStr}`;
    }
  }

  return `${newRoot}${suffix}${newBassStr}`;
}

/**
 * Transpose a single ChordItem or chord name string by semitones (+1, -1, +2, etc.)
 */
export function transposeChord(chord: ChordItem, semitones: number): ChordItem;
export function transposeChord(chord: string, semitones: number): string;
export function transposeChord(chord: ChordItem | string, semitones: number): ChordItem | string {
  if (typeof chord === "string") {
    return transposeChordName(chord, semitones);
  }

  if (semitones === 0) return chord;

  // 1. Shift all MIDI notes directly
  const newMidiNotes = (chord.midiNotes || []).map((m) => m + semitones);

  // 2. Transpose chord name
  const newName = transposeChordName(chord.name, semitones);
  const rootMatch = newName.match(/^([A-G][#b]?)/i);
  const newRoot = rootMatch ? rootMatch[1] : chord.root;

  // 3. Re-calculate human-readable note names
  const useFlats = newRoot.includes("b") || ["F", "Bb", "Eb", "Ab", "Db"].includes(newRoot);
  const newNotes = newMidiNotes.map((m) => midiToNoteName(m, useFlats));

  return {
    ...chord,
    name: newName,
    root: newRoot,
    notes: newNotes,
    midiNotes: newMidiNotes,
  };
}

/**
 * Transpose an array of ChordItems by semitones
 */
export function transposeProgression(chords: ChordItem[], semitones: number): ChordItem[] {
  return chords.map((chord) => transposeChord(chord, semitones));
}
