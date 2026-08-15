import { describe, it, expect } from "vitest";
import {
  midiToNoteName,
  noteNameToMidi,
  NOTE_NAMES_SHARP,
  NOTE_NAMES_FLAT,
  FREQUENCY_MAP,
  PITCH_CLASS_NAMES,
  noteToFrequency,
} from "./noteNames";

describe("noteNames utils audit", () => {
  it("converts MIDI note numbers to standard scientific pitch notation", () => {
    expect(midiToNoteName(60)).toBe("C4");
    expect(midiToNoteName(69)).toBe("A4");
    expect(midiToNoteName(21)).toBe("A0");
    expect(midiToNoteName(108)).toBe("C8");
    expect(midiToNoteName(0)).toBe("C-1");
  });

  it("handles negative octave MIDI and high MIDI numbers safely", () => {
    expect(midiToNoteName(12)).toBe("C0");
    expect(midiToNoteName(127)).toBe("G9");
    expect(midiToNoteName(-1)).toBe("B-2"); // Edge case
  });

  it("converts standard note strings to MIDI note numbers", () => {
    expect(noteNameToMidi("C4")).toBe(60);
    expect(noteNameToMidi("A4")).toBe(69);
    expect(noteNameToMidi("C0")).toBe(12);
    expect(noteNameToMidi("C-1")).toBe(0);
    expect(noteNameToMidi("F#4")).toBe(66);
    expect(noteNameToMidi("Gb4")).toBe(66);
    expect(noteNameToMidi("Db4")).toBe(61);
    expect(noteNameToMidi("Eb4")).toBe(63);
    expect(noteNameToMidi("Ab4")).toBe(68);
    expect(noteNameToMidi("Bb4")).toBe(70);
  });

  it("handles enharmonic corner cases: Cb, Fb, B#, E#", () => {
    expect(noteNameToMidi("Cb4")).toBe(59); // Cb4 is B3 (MIDI 59)
    expect(noteNameToMidi("Fb4")).toBe(64); // Fb4 is E4 (MIDI 64)
    expect(noteNameToMidi("B#3")).toBe(60); // B#3 is C4 (MIDI 60)
    expect(noteNameToMidi("E#4")).toBe(65); // E#4 is F4 (MIDI 65)
  });

  it("handles notes without octave gracefully", () => {
    expect(noteNameToMidi("C")).toBe(60);
    expect(noteNameToMidi("A")).toBe(69);
    expect(noteNameToMidi("F#")).toBe(66);
    expect(noteNameToMidi("Bb")).toBe(70);
  });

  it("calculates accurate frequency for notes (A4 = 440 Hz)", () => {
    expect(noteToFrequency("A4")).toBeCloseTo(440.0, 1);
    expect(noteToFrequency("C4")).toBeCloseTo(261.63, 1);
    expect(noteToFrequency("A3")).toBeCloseTo(220.0, 1);
  });
});
