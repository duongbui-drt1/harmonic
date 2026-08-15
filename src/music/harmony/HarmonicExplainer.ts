import { ChordItem } from "../../types";
import { classifyHarmonicFunction } from "./FunctionClassifier";
import { analyzeRomanNumeralAdvanced } from "./RomanAnalysis";
import { calculateHarmonicTension } from "./TensionEngine";

export interface HarmonicExplanationResult {
  romanProgression: string;
  functionalRoles: { chord: string; roman: string; role: string; explanation: string }[];
  overallMood: string;
  harmonicAnalysisText: string;
  suggestedVoiceLeadingNote: string;
}

/**
 * Generates an educational explanation answering "Why does it sound like this?" for a given progression.
 */
export function explainHarmonicFunction(
  chords: ChordItem[],
  keyName: string
): HarmonicExplanationResult {
  if (!chords || chords.length === 0) {
    return {
      romanProgression: "",
      functionalRoles: [],
      overallMood: "Neutral",
      harmonicAnalysisText: "No chords provided for harmonic explanation.",
      suggestedVoiceLeadingNote: "",
    };
  }

  const keyParts = keyName.split(" ");
  const keyRoot = keyParts[0] || "C";
  const mode = keyParts[1]?.toLowerCase() === "minor" ? "minor" : "major";

  const functionalRoles = chords.map((c, i) => {
    const nextChord = chords[i + 1]?.name;
    const analysis = classifyHarmonicFunction(c.name, keyRoot, mode, nextChord);
    const romanInfo = analyzeRomanNumeralAdvanced(c.name, keyRoot, mode, nextChord);
    return {
      chord: c.name,
      roman: c.romanNumeral || romanInfo.roman,
      role: analysis.role,
      explanation: analysis.explanation || `${c.name} functions as ${analysis.role} in ${keyName}.`,
    };
  });

  const romanProgression = functionalRoles.map((f) => f.roman).join(" → ");

  // Calculate tension dynamics
  const tensions = chords.map((c) => calculateHarmonicTension(c.name, keyRoot, mode).totalScore);
  const startTension = tensions[0] || 20;
  const maxTension = Math.max(...tensions);
  const endTension = tensions[tensions.length - 1] || 20;

  let overallMood = "Grounded & Stable";
  if (maxTension > 70) {
    overallMood = "High Tension & Dramatic Resolution";
  } else if (maxTension > 50) {
    overallMood = "Dynamic Harmonic Movement";
  } else if (mode === "minor") {
    overallMood = "Melancholic & Reflective";
  }

  // Construct educational explanation paragraph
  const chordNames = chords.map((c) => c.name).join(" → ");
  const tonicChord = chords[0]?.name || "I";
  const dominantChord = chords.find((c, i) => functionalRoles[i]?.role.toLowerCase().includes("dominant"))?.name;

  let text = `In the key of **${keyName}**, the progression **${chordNames}** (${romanProgression}) establishes its unique sound through functional tension and release. `;
  text += `It begins at **${tonicChord}** (${functionalRoles[0]?.roman || "I"}), acting as the tonal home base. `;

  if (dominantChord) {
    text += `The presence of **${dominantChord}** creates a strong harmonic pull (Dominant function), driving the listener's ear back toward resolution at the tonic. `;
  }

  if (chords.length >= 4) {
    text += `The transition between pre-dominant and dominant chords creates a smooth flow that sounds natural to human auditory perception.`;
  } else {
    text += `The concise sequence highlights the direct contrast between home stability and harmonic tension.`;
  }

  const voiceLeadingAdvice = `Smooth voice leading is maintained by holding common tones between adjacent chords and moving other notes by step (whole or half steps).`;

  return {
    romanProgression,
    functionalRoles,
    overallMood,
    harmonicAnalysisText: text,
    suggestedVoiceLeadingNote: voiceLeadingAdvice,
  };
}
