import { describe, it, expect } from "vitest";
import { transposeChord, transposeProgression } from "./chordTransposer";
import { ChordItem } from "../types";

describe("chordTransposer logic and regression audit", () => {
  it("transposes major, minor, and 7th chords by semitones", () => {
    expect(transposeChord("C", 2)).toBe("D");
    expect(transposeChord("C", 4)).toBe("E");
    expect(transposeChord("C", 7)).toBe("G");
    expect(transposeChord("C", 12)).toBe("C");
    expect(transposeChord("C", -1)).toBe("B");
    expect(transposeChord("C", -2)).toBe("Bb");

    expect(transposeChord("Am", 3)).toBe("Cm");
    expect(transposeChord("Dm7", 2)).toBe("Em7");
    expect(transposeChord("G7", 5)).toBe("C7");
  });

  it("transposes slash chords including bass note", () => {
    expect(transposeChord("C/E", 2)).toBe("D/F#");
    expect(transposeChord("Am/G", 2)).toBe("Bm/A");
    expect(transposeChord("F/A", -2)).toBe("Eb/G");
  });

  it("handles enharmonic and flat roots correctly when transposing", () => {
    expect(transposeChord("Eb", 2)).toBe("F");
    expect(transposeChord("Bb", 2)).toBe("C");
    expect(transposeChord("F#m", 1)).toBe("Gm");
    expect(transposeChord("Abmaj7", 2)).toBe("Bbmaj7");
  });

  it("transposes full chord progression objects with midiNotes and metadata", () => {
    const chords: ChordItem[] = [
      { id: "1", name: "C", root: "C", quality: "major", beats: 4, notes: ["C4", "E4", "G4"], midiNotes: [60, 64, 67] },
      { id: "2", name: "Am", root: "A", quality: "minor", beats: 4, notes: ["A3", "C4", "E4"], midiNotes: [57, 60, 64] },
      { id: "3", name: "F", root: "F", quality: "major", beats: 4, notes: ["F3", "A3", "C4"], midiNotes: [53, 57, 60] },
      { id: "4", name: "G", root: "G", quality: "major", beats: 4, notes: ["G3", "B3", "D4"], midiNotes: [55, 59, 62] },
    ];

    const transposed = transposeProgression(chords, 2);
    expect(transposed[0].name).toBe("D");
    expect(transposed[0].midiNotes).toEqual([62, 66, 69]);
    expect(transposed[1].name).toBe("Bm");
    expect(transposed[1].midiNotes).toEqual([59, 62, 66]);
    expect(transposed[2].name).toBe("G");
    expect(transposed[3].name).toBe("A");
  });
});
