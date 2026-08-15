import { describe, it, expect } from "vitest";
import { ChordRecognizer } from "./ChordRecognizer";
import { parseChordSymbolString, pitchClassToMidiValue, getChordMidiNotesFromSymbol } from "./ChordSymbol";
import { detectChordFromNotes } from "../../utils/chordDetection";

describe("ChordRecognizer and ChordSymbol Logic Audit", () => {
  it("recognizes standard root position triads (C E G -> C, A C E -> Am, G B D -> G)", () => {
    const cMajor = ChordRecognizer.recognize(["C4", "E4", "G4"]);
    expect(cMajor.bestMatch).toBeDefined();
    expect(cMajor.bestMatch?.symbol.root).toBe("C");
    expect(cMajor.bestMatch?.symbol.quality).toBe("major");
    expect(cMajor.bestMatch?.symbol.fullName).toBe("C");

    const aMinor = ChordRecognizer.recognize(["A3", "C4", "E4"]);
    expect(aMinor.bestMatch?.symbol.root).toBe("A");
    expect(aMinor.bestMatch?.symbol.quality).toBe("minor");
    expect(aMinor.bestMatch?.symbol.fullName).toBe("Am");

    const gMajor = ChordRecognizer.recognize(["G3", "B3", "D4"]);
    expect(gMajor.bestMatch?.symbol.root).toBe("G");
    expect(gMajor.bestMatch?.symbol.quality).toBe("major");
  });

  it("recognizes triad inversions (G C E -> C/G, E G C -> C/E)", () => {
    const cOverG = ChordRecognizer.recognize(["G3", "C4", "E4"]);
    expect(cOverG.bestMatch?.symbol.root).toBe("C");
    expect(cOverG.bestMatch?.symbol.bass).toBe("G");
    expect(cOverG.bestMatch?.symbol.inversion).toBe(2);

    const cOverE = ChordRecognizer.recognize(["E3", "G3", "C4"]);
    expect(cOverE.bestMatch?.symbol.root).toBe("C");
    expect(cOverE.bestMatch?.symbol.bass).toBe("E");
    expect(cOverE.bestMatch?.symbol.inversion).toBe(1);
  });

  it("recognizes 7th, 9th, sus, and diminished chords accurately", () => {
    const cMaj7 = ChordRecognizer.recognize(["C4", "E4", "G4", "B4"]);
    expect(cMaj7.bestMatch?.symbol.root).toBe("C");
    expect(cMaj7.bestMatch?.symbol.quality).toBe("major7");

    const gDom7 = ChordRecognizer.recognize(["G3", "B3", "D4", "F4"]);
    expect(gDom7.bestMatch?.symbol.root).toBe("G");
    expect(gDom7.bestMatch?.symbol.quality).toBe("dominant7");

    const dMin7 = ChordRecognizer.recognize(["D4", "F4", "A4", "C5"]);
    expect(dMin7.bestMatch?.symbol.root).toBe("D");
    expect(dMin7.bestMatch?.symbol.quality).toBe("minor7");

    const bHalfDim = ChordRecognizer.recognize(["B3", "D4", "F4", "A4"]);
    expect(bHalfDim.bestMatch?.symbol.root).toBe("B");
    expect(bHalfDim.bestMatch?.symbol.quality).toBe("halfDiminished7");

    const cDim7 = ChordRecognizer.recognize(["C4", "Eb4", "Gb4", "A4"]);
    expect(cDim7.bestMatch?.symbol.root).toBe("C");
    expect(cDim7.bestMatch?.symbol.quality).toBe("diminished7");

    const dSus4 = ChordRecognizer.recognize(["D4", "G4", "A4"]);
    expect(dSus4.bestMatch?.symbol.root).toBe("D");
    expect(dSus4.bestMatch?.symbol.quality).toBe("sus4");

    const dSus2 = ChordRecognizer.recognize(["D4", "E4", "A4"]);
    expect(dSus2.bestMatch?.symbol.root).toBe("D");
    expect(dSus2.bestMatch?.symbol.quality).toBe("sus2");
  });

  it("handles pitchClassToMidiValue with enharmonic and lowercase inputs", () => {
    expect(pitchClassToMidiValue("C")).toBe(0);
    expect(pitchClassToMidiValue("C#")).toBe(1);
    expect(pitchClassToMidiValue("Db")).toBe(1);
    expect(pitchClassToMidiValue("Cb")).toBe(11);
    expect(pitchClassToMidiValue("B#")).toBe(0);
    expect(pitchClassToMidiValue("Fb")).toBe(4);
    expect(pitchClassToMidiValue("E#")).toBe(5);
    expect(pitchClassToMidiValue("f#")).toBe(6);
    expect(pitchClassToMidiValue("eb")).toBe(3);
  });

  it("handles parseChordSymbolString for complex and edge-case strings", () => {
    const sym1 = parseChordSymbolString("C#m7/G#");
    expect(sym1.root).toBe("C#");
    expect(sym1.quality).toBe("minor7");
    expect(sym1.bass).toBe("G#");

    const sym2 = parseChordSymbolString("Fmaj7");
    expect(sym2.root).toBe("F");
    expect(sym2.quality).toBe("major7");

    const sym3 = parseChordSymbolString("Ab7");
    expect(sym3.root).toBe("Ab");
    expect(sym3.quality).toBe("dominant7");

    const sym4 = parseChordSymbolString("Bdim");
    expect(sym4.root).toBe("B");
    expect(sym4.quality).toBe("diminished");
  });

  it("evaluates detectChordFromNotes utility", () => {
    const res = detectChordFromNotes(["C4", "E4", "G4"]);
    expect(res.name).toBe("C");
    expect(res.notes).toEqual(["C4", "E4", "G4"]);

    const resAm = detectChordFromNotes(["A3", "C4", "E4"]);
    expect(resAm.name).toBe("Am");
  });
});
