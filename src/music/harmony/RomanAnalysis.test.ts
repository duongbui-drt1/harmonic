import { describe, it, expect } from "vitest";
import { analyzeRomanNumeralAdvanced } from "./RomanAnalysis";
import { detectKeyFromChords, getRomanNumeral } from "../../utils/keyDetection";

describe("Roman Analysis and Key Detection Audit", () => {
  it("analyzes diatonic chords in C Major (I, ii, iii, IV, V, vi, vii°)", () => {
    const c = analyzeRomanNumeralAdvanced("C", "C", "major");
    expect(c.roman).toBe("I");
    expect(c.type).toBe("diatonic");
    expect(c.functionRole).toBe("Tonic");

    const dm = analyzeRomanNumeralAdvanced("Dm", "C", "major");
    expect(dm.roman).toBe("ii");
    expect(dm.functionRole).toBe("Predominant");

    const g7 = analyzeRomanNumeralAdvanced("G7", "C", "major");
    expect(g7.roman).toBe("V7");
    expect(g7.functionRole).toBe("Dominant");

    const am = analyzeRomanNumeralAdvanced("Am", "C", "major");
    expect(am.roman).toBe("vi");
  });

  it("detects Secondary Dominants (e.g. V7/ii, V7/V, V7/vi in C Major)", () => {
    // A7 in C Major -> V7/ii (A7 resolves to Dm)
    const a7 = analyzeRomanNumeralAdvanced("A7", "C", "major");
    expect(a7.type).toBe("secondary_dominant");
    expect(a7.roman).toBe("V7/ii");

    // D7 in C Major -> V7/V (D7 resolves to G)
    const d7 = analyzeRomanNumeralAdvanced("D7", "C", "major");
    expect(d7.type).toBe("secondary_dominant");
    expect(d7.roman).toBe("V7/V");

    // E7 in C Major -> V7/vi (E7 resolves to Am)
    const e7 = analyzeRomanNumeralAdvanced("E7", "C", "major");
    expect(e7.type).toBe("secondary_dominant");
    expect(e7.roman).toBe("V7/vi");
  });

  it("detects Tritone Substitutions (e.g. Db7 in C Major -> subV7/I)", () => {
    const db7 = analyzeRomanNumeralAdvanced("Db7", "C", "major");
    expect(db7.type).toBe("tritone_sub");
    expect(db7.roman).toBe("subV7/I");
  });

  it("detects Modal Interchange / Borrowed chords (e.g. Fm, Ab, Bb in C Major)", () => {
    const ab = analyzeRomanNumeralAdvanced("Ab", "C", "major");
    expect(ab.type).toBe("borrowed");
    expect(ab.roman).toBe("bVI");

    const bb = analyzeRomanNumeralAdvanced("Bb", "C", "major");
    expect(bb.type).toBe("borrowed");
    expect(bb.roman).toBe("bVII");

    const fm = analyzeRomanNumeralAdvanced("Fm", "C", "major");
    expect(fm.type).toBe("borrowed");
    expect(fm.roman).toBe("iv");
  });

  it("detects key accurately from chord progressions using keyDetection", () => {
    const key1 = detectKeyFromChords(["C", "Am", "F", "G"]);
    expect(key1.key).toBe("C");
    expect(key1.mode).toBe("major");

    const key2 = detectKeyFromChords(["Am", "Dm", "E7", "Am"]);
    expect(key2.key).toBe("A");
    expect(key2.mode).toBe("minor");
  });

  it("formats Roman numeral strings via getRomanNumeral helper", () => {
    expect(getRomanNumeral("C", "C", "major")).toBe("I");
    expect(getRomanNumeral("Dm", "C", "major")).toBe("ii");
    expect(getRomanNumeral("G7", "C", "major")).toBe("V7");
    expect(getRomanNumeral("Fmaj7", "C", "major")).toBe("IVmaj7");
  });
});
