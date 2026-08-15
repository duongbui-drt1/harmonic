import { describe, it, expect } from "vitest";
import { subsampleSampleMap } from "./soundfontLoader";

describe("Soundfont Loader & Subsampling Audit", () => {
  it("subsamples full 88-note sample map to anchor pitches for fast decoding", () => {
    // Generate a mock 88-note sample map
    const mockMap: Record<string, string> = {};
    const notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    for (let oct = 0; oct <= 8; oct++) {
      for (const n of notes) {
        mockMap[`${n}${oct}`] = `data:audio/mp3;base64,mock_${n}${oct}`;
      }
    }

    const subsampled = subsampleSampleMap(mockMap, 24);
    const keys = Object.keys(subsampled);

    expect(keys.length).toBeLessThanOrEqual(24);
    expect(keys.length).toBeGreaterThanOrEqual(10);
    expect(subsampled["C4"]).toBeDefined();
    expect(subsampled["A4"]).toBeDefined();
    expect(subsampled["C1"]).toBeDefined();
  });

  it("leaves maps smaller than maxSamples untouched", () => {
    const smallMap = {
      C4: "data:mock1",
      E4: "data:mock2",
      G4: "data:mock3",
    };
    const result = subsampleSampleMap(smallMap, 24);
    expect(Object.keys(result).length).toBe(3);
  });
});

