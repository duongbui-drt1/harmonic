import { TensionScore } from "../types";
import { parseChordSymbolString, pitchClassToMidiValue } from "../chords/ChordSymbol";

export function calculateHarmonicTension(
  chordInput: string,
  keyRoot = "C",
  keyMode: "major" | "minor" = "major"
): TensionScore {
  const sym = parseChordSymbolString(chordInput);
  const rootMidi = pitchClassToMidiValue(sym.root);
  const keyMidi = pitchClassToMidiValue(keyRoot);
  const intervalFromTonic = (rootMidi - keyMidi + 12) % 12;

  let dissonance = 20; // base
  let dominantDrive = 0;
  let chromaticism = 0;
  let instability = 15;

  // Quality dissonance score
  switch (sym.quality) {
    case "major":
      dissonance = 10;
      instability = 10;
      break;
    case "minor":
      dissonance = 25;
      instability = 20;
      break;
    case "dominant7":
    case "dominant9":
    case "dominant11":
    case "dominant13":
      dissonance = 60;
      dominantDrive = 85;
      instability = 70;
      break;
    case "diminished":
    case "diminished7":
      dissonance = 85;
      dominantDrive = 90;
      instability = 90;
      break;
    case "halfDiminished7":
      dissonance = 70;
      dominantDrive = 65;
      instability = 75;
      break;
    case "augmented":
      dissonance = 80;
      instability = 85;
      break;
    case "alteredDominant":
      dissonance = 95;
      dominantDrive = 98;
      instability = 95;
      break;
    case "sus2":
    case "sus4":
      dissonance = 40;
      instability = 55;
      break;
  }

  // Circle of fifths distance from tonic
  const fifthsDistanceMap: Record<number, number> = {
    0: 0,  // Tonic I
    7: 15, // Dominant V
    5: 15, // Subdominant IV
    2: 25, // ii
    9: 20, // vi
    4: 30, // iii
    11: 45, // vii°
    1: 75,  // bII
    6: 85,  // bV / tritone
    8: 60,  // bVI
    3: 50,  // bIII
    10: 40  // bVII
  };

  const distScore = fifthsDistanceMap[intervalFromTonic] || 50;

  if (![0, 2, 4, 5, 7, 9, 11].includes(intervalFromTonic)) {
    chromaticism = 70;
  }

  const totalScore = Math.min(100, Math.max(5, Math.round(
    dissonance * 0.35 + dominantDrive * 0.25 + chromaticism * 0.20 + distScore * 0.20
  )));

  let explanation = "Âm hưởng êm dịu, vững chãi.";
  if (totalScore > 75) {
    explanation = "Sức hút căng thẳng cực lớn, hối hả đòi giải kết về Chủ âm.";
  } else if (totalScore > 50) {
    explanation = "Độ căng trung bình, gia tăng màu sắc và chuyển động cho giai điệu.";
  }

  return {
    chordName: chordInput,
    totalScore,
    dissonance,
    dominantDrive,
    chromaticism,
    instability,
    distanceFromTonic: distScore,
    explanation,
  };
}
