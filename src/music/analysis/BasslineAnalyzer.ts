import { BasslineAnalysis } from "../types";
import { parseChordSymbolString } from "../chords/ChordSymbol";

export function analyzeBasslineInteraction(chords: Array<{ name: string; beats: number }>): BasslineAnalysis {
  if (!chords || chords.length === 0) {
    return {
      notes: [],
      contour: "stepwise",
      smoothnessScore: 0,
      hasPedalTone: false,
      suggestions: [],
    };
  }

  const bassNotes = chords.map((c) => {
    const sym = parseChordSymbolString(c.name);
    return sym.bass || sym.root;
  });

  const uniqueBass = Array.from(new Set(bassNotes));
  const hasPedal = uniqueBass.length === 1 && bassNotes.length >= 3;

  let contour: BasslineAnalysis["contour"] = "stepwise";
  if (hasPedal) contour = "pedal";

  const suggestions: string[] = [];
  if (!chords.some((c) => c.name.includes("/"))) {
    suggestions.push("Thử dùng hợp âm đảo Bass (Slash chord) như C -> G/B -> Am để ngón Bass di chuyển từng bước mượt mà.");
  } else {
    suggestions.push("Đường tiếng Trầm (Bassline) đã có hợp âm đảo Bass di chuyển liền nét đẹp mắt.");
  }

  return {
    notes: bassNotes,
    contour,
    smoothnessScore: hasPedal ? 95 : 82,
    hasPedalTone: hasPedal,
    pedalNote: hasPedal ? uniqueBass[0] : undefined,
    suggestions,
  };
}
