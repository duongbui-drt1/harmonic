import { DetailedRomanNumeral, HarmonicFunctionRole } from "../types";
import { parseChordSymbolString, pitchClassToMidiValue, NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from "../chords/ChordSymbol";

export const DIATONIC_SCALE_STEPS_MAJOR = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
export const DIATONIC_SCALE_STEPS_MINOR = [0, 2, 3, 5, 7, 8, 10]; // C D Eb F G Ab Bb

export function getNoteInKey(keyRoot: string, semitonesFromKeyRoot: number, isMinor = false): string {
  const rootVal = pitchClassToMidiValue(keyRoot);
  const targetVal = (rootVal + semitonesFromKeyRoot) % 12;
  const useFlats = keyRoot.includes("b") || ["F", "Bb", "Eb", "Ab", "Db"].includes(keyRoot);
  return useFlats ? NOTE_NAMES_FLAT[targetVal] : NOTE_NAMES_SHARP[targetVal];
}

export function analyzeRomanNumeralAdvanced(
  chordInput: string,
  keyRoot: string = "C",
  keyMode: "major" | "minor" = "major",
  nextChordInput?: string
): DetailedRomanNumeral {
  const sym = parseChordSymbolString(chordInput);
  const rootMidi = pitchClassToMidiValue(sym.root);
  const keyMidi = pitchClassToMidiValue(keyRoot);
  const interval = (rootMidi - keyMidi + 12) % 12;

  const isMinorKey = keyMode === "minor";
  const scaleSteps = isMinorKey ? DIATONIC_SCALE_STEPS_MINOR : DIATONIC_SCALE_STEPS_MAJOR;

  const romanNumeralsMajor = ["I", "bII", "II", "bIII", "III", "IV", "bV", "V", "bVI", "VI", "bVII", "VII"];
  const baseNumeral = romanNumeralsMajor[interval] || "I";

  const isMinorChord = sym.quality.includes("minor") || sym.quality === "minor" || sym.quality === "minor7" || sym.quality === "diminished";
  const formattedNumeral = isMinorChord ? baseNumeral.toLowerCase() : baseNumeral;

  // 1. Check for Secondary Dominant (e.g. V7/ii, V7/V, V7/vi)
  // Target of V7 is 5 semitones down / 7 semitones up from root
  const targetMidi = (rootMidi + 5) % 12;
  const targetInterval = (targetMidi - keyMidi + 12) % 12;

  // A secondary dominant must be a dominant quality (or a major triad acting as secondary dominant when not diatonic I/IV)
  const isExplicitDominant = sym.quality === "dominant7" || sym.quality === "dominant9";
  const isAlteredMajorTriad = sym.quality === "major" && interval !== 0 && interval !== 5;

  if ((isExplicitDominant || isAlteredMajorTriad) && interval !== 7) {
    const targetRomanBase = romanNumeralsMajor[targetInterval];
    const targetInScale = scaleSteps.includes(targetInterval);
    if (targetInScale && targetInterval !== 0) {
      const targetIsMinor = [2, 4, 9].includes(targetInterval); // ii, iii, vi in major
      const targetStr = targetIsMinor ? targetRomanBase.toLowerCase() : targetRomanBase;
      return {
        roman: `V7/${targetStr}`,
        type: "secondary_dominant",
        explanation: `At phụ (Secondary dominant) chuẩn bị độn vào hợp âm ${getNoteInKey(keyRoot, targetInterval)} (${targetStr}).`,
        functionRole: "Secondary Dominant",
        appliedTarget: targetStr,
      };
    }
  }

  // 2. Check for Tritone Substitution (subV7/I or subV7/ii, etc.) e.g. Db7 -> Cmaj7
  if (sym.quality === "dominant7" || sym.quality === "dominant9") {
    // If root is bII (1 semitone above target tonic) or bVI
    if (interval === 1) {
      return {
        roman: "subV7/I",
        type: "tritone_sub",
        explanation: "Thay thế tam thanh (Tritone substitution) thay cho V7, vuốt mượt về I.",
        functionRole: "Substitute",
        appliedTarget: "I",
      };
    }
    if (interval === 10) {
      return {
        roman: "bVII7",
        type: "backdoor",
        explanation: "Hợp âm Backdoor Dominant (bVII7) vuốt về Cửa sau Cmaj7.",
        functionRole: "Substitute",
        appliedTarget: "I",
      };
    }
  }

  // 3. Check for Borrowed Chords / Modal Interchange (bVI, bVII, bIII, iv in major)
  if (!isMinorKey) {
    if (interval === 8) {
      return {
        roman: isMinorChord ? "vi" : "bVI",
        type: "borrowed",
        explanation: "Vay mượn điệu tính (Modal interchange / Borrowed chord) từ Giọng Thứ song song.",
        functionRole: "Borrowed",
      };
    }
    if (interval === 10) {
      return {
        roman: "bVII",
        type: "borrowed",
        explanation: "Hợp âm vay mượn bVII từ Aeolian mode tạo âm hưởng Pop/Rock tự do.",
        functionRole: "Borrowed",
      };
    }
    if (interval === 3) {
      return {
        roman: "bIII",
        type: "borrowed",
        explanation: "Hợp âm bIII màu sắc Chromatic Mediant vay mượn.",
        functionRole: "Borrowed",
      };
    }
    if (interval === 5 && isMinorChord) {
      return {
        roman: "iv",
        type: "borrowed",
        explanation: "Hợp âm iv thứ vay mượn tạo cảm giác xao xuyến da diết.",
        functionRole: "Borrowed",
      };
    }
  }

  // 4. Diatonic Chords
  let role: HarmonicFunctionRole = "Tonic";
  if (interval === 0) role = "Tonic";
  else if (interval === 2 || interval === 5) role = "Predominant";
  else if (interval === 7 || interval === 11) role = "Dominant";
  else if (interval === 9) role = "Tonic";
  else if (interval === 4) role = "Tonic";

  let suffix = "";
  if (sym.quality === "major7") suffix = "maj7";
  else if (sym.quality === "minor7") suffix = "7";
  else if (sym.quality === "dominant7") suffix = "7";
  else if (sym.quality === "halfDiminished7") suffix = "ø7";
  else if (sym.quality === "diminished7") suffix = "°7";

  return {
    roman: `${formattedNumeral}${suffix}`,
    type: "diatonic",
    explanation: `Hợp âm Diatonic bậc ${formattedNumeral} thuộc giọng ${keyRoot} ${keyMode}.`,
    functionRole: role,
  };
}
