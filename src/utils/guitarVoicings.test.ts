import { describe, it, expect } from "vitest";
import { getGuitarFingering, getGuitarMidiNotes, GUITAR_TUNING_MIDI } from "./guitarVoicings";

describe("Guitar Voicings and Fretboard Engine Audit", () => {
  it("provides standard open chord fingerings (C, G, D, Em, Am)", () => {
    const c = getGuitarFingering("C");
    expect(c.frets).toEqual([-1, 3, 2, 0, 1, 0]);

    const g = getGuitarFingering("G");
    expect(g.frets).toEqual([3, 2, 0, 0, 0, 3]);

    const d = getGuitarFingering("D");
    expect(d.frets).toEqual([-1, -1, 0, 2, 3, 2]);

    const em = getGuitarFingering("Em");
    expect(em.frets).toEqual([0, 2, 2, 0, 0, 0]);

    const am = getGuitarFingering("Am");
    expect(am.frets).toEqual([-1, 0, 2, 2, 1, 0]);
  });

  it("calculates exact guitar MIDI notes from standard tuning", () => {
    // Standard tuning: E2(40), A2(45), D3(50), G3(55), B3(59), E4(64)
    expect(GUITAR_TUNING_MIDI).toEqual([40, 45, 50, 55, 59, 64]);

    const cFingering = getGuitarFingering("C");
    const cMidis = getGuitarMidiNotes(cFingering);
    // Frets: [-1, 3(C3=48), 2(E3=52), 0(G3=55), 1(C4=60), 0(E4=64)]
    expect(cMidis).toEqual([48, 52, 55, 60, 64]);
  });

  it("generates barre chord fingerings for non-open chords dynamically (e.g. F#m, Ab7, C#m)", () => {
    const fSharpMinor = getGuitarFingering("F#m");
    expect(fSharpMinor.barre).toBeDefined();
    expect(fSharpMinor.frets[0]).toBeGreaterThanOrEqual(1);

    const cSharpMinor = getGuitarFingering("C#m");
    expect(cSharpMinor.barre).toBeDefined();
  });
});
