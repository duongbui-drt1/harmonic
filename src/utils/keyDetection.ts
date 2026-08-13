import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from "./noteNames";
import { parseChordName } from "./chordData";

export interface KeyResult {
  key: string; // e.g. "C", "Am"
  root: string; // e.g. "C", "A"
  mode: "major" | "minor";
  displayName: string; // e.g. "C Major", "A Minor"
}

// Diatonic intervals (semitones from key root)
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

// Diatonic triad/7th qualities for Major scale: [I=M, ii=m, iii=m, IV=M, V=M, vi=m, vii°=dim]
const MAJOR_DIATONIC_ROMAN = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
const MINOR_DIATONIC_ROMAN = ["i", "ii°", "III", "iv", "v", "VI", "VII"];

export function detectKeyFromChords(chordNames: string[]): KeyResult {
  if (!chordNames || chordNames.length === 0) {
    return { key: "C", root: "C", mode: "major", displayName: "C Major" };
  }

  const parsedChords = chordNames.map((name) => parseChordName(name)).filter(Boolean);
  if (parsedChords.length === 0) {
    return { key: "C", root: "C", mode: "major", displayName: "C Major" };
  }

  // Pitch class counts and weights
  let maxScore = -1;
  let bestKey = "C";
  let bestMode: "major" | "minor" = "major";

  for (let rootPc = 0; rootPc < 12; rootPc++) {
    const rootName = NOTE_NAMES_SHARP[rootPc];

    // Score Major key
    let majorScore = 0;
    parsedChords.forEach((c, idx) => {
      if (!c) return;
      let chordRootPc = NOTE_NAMES_SHARP.indexOf(c.root);
      if (chordRootPc === -1) chordRootPc = NOTE_NAMES_FLAT.indexOf(c.root);
      if (chordRootPc === -1) return;

      const semitones = (chordRootPc - rootPc + 12) % 12;
      const isFirst = idx === 0;
      const isLast = idx === parsedChords.length - 1;

      // Diatonic match bonus
      if (MAJOR_SCALE.includes(semitones)) {
        majorScore += 3;
        // Extra weight for Tonic (0), Dominant (7), Subdominant (5)
        if (semitones === 0) majorScore += isFirst || isLast ? 6 : 4;
        if (semitones === 7) majorScore += 3;
        if (semitones === 5) majorScore += 2;
      } else {
        majorScore -= 1; // Non-diatonic penalty
      }
    });

    if (majorScore > maxScore) {
      maxScore = majorScore;
      bestKey = rootName;
      bestMode = "major";
    }

    // Score Minor key
    let minorScore = 0;
    parsedChords.forEach((c, idx) => {
      if (!c) return;
      let chordRootPc = NOTE_NAMES_SHARP.indexOf(c.root);
      if (chordRootPc === -1) chordRootPc = NOTE_NAMES_FLAT.indexOf(c.root);
      if (chordRootPc === -1) return;

      const semitones = (chordRootPc - rootPc + 12) % 12;
      const isFirst = idx === 0;
      const isLast = idx === parsedChords.length - 1;

      if (MINOR_SCALE.includes(semitones)) {
        minorScore += 3;
        if (semitones === 0) minorScore += isFirst || isLast ? 6 : 4;
        if (semitones === 7) minorScore += 3;
        if (semitones === 5) minorScore += 2;
      } else {
        minorScore -= 1;
      }
    });

    if (minorScore > maxScore) {
      maxScore = minorScore;
      bestKey = rootName;
      bestMode = "minor";
    }
  }

  const displayName = `${bestKey} ${bestMode === "major" ? "Major" : "Minor"}`;
  return {
    key: bestKey,
    root: bestKey,
    mode: bestMode,
    displayName,
  };
}

export function getRomanNumeral(chordName: string, keyRoot: string, mode: "major" | "minor"): string {
  const parsed = parseChordName(chordName);
  if (!parsed) return chordName;

  let keyPc = NOTE_NAMES_SHARP.indexOf(keyRoot);
  if (keyPc === -1) keyPc = NOTE_NAMES_FLAT.indexOf(keyRoot);
  if (keyPc === -1) keyPc = 0;

  let chordPc = NOTE_NAMES_SHARP.indexOf(parsed.root);
  if (chordPc === -1) chordPc = NOTE_NAMES_FLAT.indexOf(parsed.root);
  if (chordPc === -1) return chordName;

  const semitones = (chordPc - keyPc + 12) % 12;
  const scale = mode === "major" ? MAJOR_SCALE : MINOR_SCALE;
  const scaleIndex = scale.indexOf(semitones);

  let romanBase = "";
  if (scaleIndex !== -1) {
    romanBase = mode === "major" ? MAJOR_DIATONIC_ROMAN[scaleIndex] : MINOR_DIATONIC_ROMAN[scaleIndex];
  } else {
    // Non-diatonic, e.g., bII, bVI, #IV
    const intervalMap: Record<number, string> = {
      1: "bII",
      3: mode === "major" ? "bIII" : "III",
      6: "#IV",
      8: mode === "major" ? "bVI" : "VI",
      10: mode === "major" ? "bVII" : "VII",
    };
    romanBase = intervalMap[semitones] || parsed.root;
  }

  // Append quality extensions e.g. 7, maj7, dim, etc.
  const qual = parsed.qualityDef.quality;
  if (qual === "7") return `${romanBase}7`;
  if (qual === "maj7") return `${romanBase}maj7`;
  if (qual === "m7") return `${romanBase}7`;
  if (qual === "m7b5") return `${romanBase}ø7`;
  if (qual === "dim7") return `${romanBase}°7`;
  if (qual === "sus4") return `${romanBase}sus4`;
  if (qual === "sus2") return `${romanBase}sus2`;
  if (qual === "add9") return `${romanBase}add9`;

  return romanBase;
}
