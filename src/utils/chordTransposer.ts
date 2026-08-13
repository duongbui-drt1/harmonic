import { ChordItem } from "../types";
import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT, midiToNoteName, noteNameToMidi } from "./noteNames";
import { parseChordName } from "./chordData";

/**
 * Transpose a single ChordItem by a given number of semitones (+1, -1, +2, etc.)
 */
export function transposeChord(chord: ChordItem, semitones: number): ChordItem {
  if (semitones === 0) return chord;

  // 1. Shift all MIDI notes directly
  const newMidiNotes = (chord.midiNotes || []).map((m) => m + semitones);

  // 2. Parse chord name to extract root, quality suffix, and optional slash bass
  const cleanName = chord.name.trim();
  let mainChordStr = cleanName;
  let bassStr: string | undefined;

  if (cleanName.includes("/")) {
    const parts = cleanName.split("/");
    mainChordStr = parts[0];
    bassStr = parts[1];
  }

  const rootMatch = mainChordStr.match(/^([A-G][#b]?)(.*)$/i);
  let newRoot = chord.root;
  let newName = chord.name;

  if (rootMatch) {
    const rawRoot = rootMatch[1];
    const suffix = rootMatch[2] || "";

    // Determine root pitch index (0 to 11)
    let rootMidi = noteNameToMidi(`${rawRoot}4`);
    let rootPitchClass = (rootMidi % 12 + 12) % 12;
    let newRootPitchClass = (rootPitchClass + semitones + 12) % 12;

    // Use flats if semitones < 0 or original root had a flat, otherwise sharps
    const preferFlats = semitones < 0 || rawRoot.includes("b") || ["F", "Bb", "Eb", "Ab", "Db"].includes(rawRoot);
    newRoot = preferFlats ? NOTE_NAMES_FLAT[newRootPitchClass] : NOTE_NAMES_SHARP[newRootPitchClass];

    // Transpose slash bass if present
    let newBassStr = "";
    if (bassStr) {
      const bassMatch = bassStr.match(/^([A-G][#b]?)(.*)$/i);
      if (bassMatch) {
        let bassMidi = noteNameToMidi(`${bassMatch[1]}4`);
        let bassPitchClass = (bassMidi % 12 + 12) % 12;
        let newBassPitchClass = (bassPitchClass + semitones + 12) % 12;
        const newBassRoot = preferFlats ? NOTE_NAMES_FLAT[newBassPitchClass] : NOTE_NAMES_SHARP[newBassPitchClass];
        newBassStr = `/${newBassRoot}${bassMatch[2] || ""}`;
      } else {
        newBassStr = `/${bassStr}`;
      }
    }

    newName = `${newRoot}${suffix}${newBassStr}`;
  }

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
