import { HarmonicPreviewContext } from "./lyriaTypes";
import { LYRIA_STYLE_PRESETS } from "./lyriaPresets";

/**
 * Deterministically constructs a structured musical prompt for Lyria.
 * Ensures harmonic facts (chords, key, tempo, functions) remain exact.
 */
export function buildLyriaPrompt(context: HarmonicPreviewContext): string {
  const {
    progression,
    key,
    mode,
    bpm,
    timeSignature,
    harmonicFunctions,
    genre,
    selectedChord,
    chordContextMode,
    previewMode,
    instrumentation,
    energy = "medium",
    density = "moderate",
    customInstructions,
  } = context;

  const chordProgressionStr = progression
    .map((c) => c.name)
    .join(" → ");

  const functionsStr = harmonicFunctions && harmonicFunctions.length > 0
    ? harmonicFunctions.join(" → ")
    : progression.map((c) => c.functionRole || c.romanNumeral || c.name).join(" → ");

  // Find matching style preset if genre is provided
  const preset = LYRIA_STYLE_PRESETS.find(
    (p) => p.id === genre || p.name.toLowerCase().includes((genre || "").toLowerCase())
  ) || LYRIA_STYLE_PRESETS[0];

  const selectedInstr = (instrumentation && instrumentation.length > 0)
    ? instrumentation.join(", ")
    : preset.instrumentation.join(", ");

  let prompt = "";

  if (previewMode === "pure_harmony") {
    prompt = `Key: ${key} (${mode})
Tempo: ${bpm} BPM
Time signature: ${timeSignature}

Harmony Progression:
${chordProgressionStr}

Harmonic Functions:
${functionsStr}

Arrangement Style:
Minimalist educational pure harmony preview.

Instrumentation:
${selectedInstr}

Purpose:
Create a short, clear instrumental preview that demonstrates the exact harmonic progression (${chordProgressionStr}) cleanly. 
Keep the arrangement very sparse and uncluttered so that every chord change and harmonic color is distinctly audible. 
No dense vocal melodies or distracting lead solos. Pure instrumental harmony focus.`;

  } else if (previewMode === "styled_preview") {
    prompt = `Key: ${key} (${mode})
Tempo: ${bpm} BPM
Time signature: ${timeSignature}

Harmony Progression:
${chordProgressionStr}

Harmonic Functions:
${functionsStr}

Style & Genre:
${preset.name} (${preset.genreCategory})
Character & Mood: ${preset.moodKeywords.join(", ")}, energy: ${energy}, density: ${density}

Instrumentation:
${selectedInstr}

Purpose:
Create a short instrumental track in the style of ${preset.name} that interprets the chord progression ${chordProgressionStr}.
Emphasize the style's signature groove and timbre while ensuring the core chord progression is clearly perceptible to the listener. Instrumental only.`;

  } else if (previewMode === "reharmonization") {
    const reharmonizedStr = context.reharmonizedProgression
      ? context.reharmonizedProgression.map((c) => c.name).join(" → ")
      : chordProgressionStr;

    const activeProgression = context.isReharmonizedVariant ? reharmonizedStr : chordProgressionStr;

    prompt = `Key: ${key} (${mode})
Tempo: ${bpm} BPM
Time signature: ${timeSignature}

Reharmonized Harmony Progression:
${activeProgression}

Compare Context:
Original: ${chordProgressionStr}
Reharmonized Variant: ${reharmonizedStr}

Style & Instrumentation:
${preset.name} with ${selectedInstr}

Purpose:
Generate a musical instrumental demonstration highlighting the reharmonized progression (${activeProgression}). 
Make the rich chord colors, extensions, and Voice-Leading substitutions clearly audible in the arrangement. Instrumental only.`;

  } else if (previewMode === "chord_understanding") {
    const chordName = selectedChord?.name || progression[0]?.name || "Cmaj7";
    
    let contextDescription = `Demonstrate the individual harmonic color of the single chord ${chordName}.`;
    if (chordContextMode === "resolution") {
      contextDescription = `Demonstrate the tension and resolution behavior of ${chordName} resolving smoothly into its target tonic or tonic-equivalent in ${key}.`;
    } else if (chordContextMode === "jpop") {
      contextDescription = `Demonstrate the harmonic color of ${chordName} in a J-Pop / Anime musical context with bright piano and clean guitars.`;
    } else if (chordContextMode === "jazz") {
      contextDescription = `Demonstrate the rich jazz voice leading and extension color of ${chordName} in a Jazz Standard arrangement with Rhodes and double bass.`;
    } else if (chordContextMode === "cinematic") {
      contextDescription = `Demonstrate the epic orchestral feeling of ${chordName} with warm cinematic strings and French horns.`;
    }

    prompt = `Key: ${key}
Tempo: ${bpm} BPM
Target Chord Focus: ${chordName}

Instrumentation:
${selectedInstr}

Purpose:
${contextDescription}
Make the unique harmonic personality and interval extensions of ${chordName} clearly audible to a student learning music theory. Instrumental only.`;
  }

  if (customInstructions && customInstructions.trim()) {
    prompt += `\n\nAdditional Aesthetic Detail:\n${customInstructions.trim()}`;
  }

  return prompt;
}
