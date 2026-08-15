import { describe, it, expect } from "vitest";
import { compareVoiceLeading, findSmootherVoicings } from "./VoiceLeading";

describe("Voice Leading Analysis Audit", () => {
  it("calculates voice leading distances between adjacent chords", () => {
    // C -> G
    const comp = compareVoiceLeading("C", "G");
    expect(comp.chordA).toBe("C");
    expect(comp.chordB).toBe("G");
    expect(comp.noteMotions.length).toBeGreaterThanOrEqual(3);
    expect(comp.totalSemitoneMovement).toBeGreaterThan(0);
    expect(comp.smoothnessScore).toBeGreaterThan(0);
  });

  it("identifies common tones correctly (e.g. G in C and G, C and E in C and Am)", () => {
    const cToAm = compareVoiceLeading("C", "Am");
    expect(cToAm.commonTones).toContain("C");
    expect(cToAm.commonTones).toContain("E");
  });

  it("finds smoother inversions to minimize voice leading jump distance", () => {
    const smoothOptions = findSmootherVoicings("C", "F");
    expect(smoothOptions.length).toBeGreaterThan(0);
    expect(smoothOptions[0].smoothnessScore).toBeGreaterThanOrEqual(smoothOptions[smoothOptions.length - 1].smoothnessScore);
  });
});
