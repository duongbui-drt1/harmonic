import { ModulationEvent } from "../types";
import { parseChordSymbolString } from "../chords/ChordSymbol";

export function detectModulationsInProgression(
  chords: Array<{ name: string; beats: number }>,
  initialKey = "C"
): ModulationEvent[] {
  if (!chords || chords.length < 4) return [];

  const events: ModulationEvent[] = [];

  // Check for pivot chords or direct key changes
  chords.forEach((c, idx) => {
    const sym = parseChordSymbolString(c.name);

    // Example pivot to G major via Dm7 -> D7 -> G
    if (sym.root === "D" && sym.quality === "dominant7" && initialKey === "C") {
      events.push({
        barNumber: idx + 1,
        fromKey: "C Major",
        toKey: "G Major",
        modulationType: "pivot_chord",
        pivotChordName: c.name,
        confidence: 88,
        explanation: `Phát hiện chuyển giọng (Modulation) từ C Major sang G Major thông qua Hợp âm bản lề / Át phụ ${c.name}.`,
      });
    }

    // Example pivot to A minor via E7
    if (sym.root === "E" && (sym.quality === "dominant7" || sym.quality === "major") && initialKey === "C") {
      events.push({
        barNumber: idx + 1,
        fromKey: "C Major",
        toKey: "A Minor",
        modulationType: "secondary_dominant",
        pivotChordName: c.name,
        confidence: 92,
        explanation: `Phát hiện chuyển sang giọng Am (A Minor) thông qua Át phụ E7.`,
      });
    }
  });

  return events;
}
