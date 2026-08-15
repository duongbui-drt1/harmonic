import { MusicGenerationRequest } from "./types";
import { ChordItem } from "../../types";

/**
 * Validates whether a chord progression is ready for ACE-Step audio generation.
 */
export function validateChordProgression(chords: ChordItem[]): { valid: boolean; message?: string } {
  if (!chords || !Array.isArray(chords) || chords.length === 0) {
    return { valid: false, message: "Chord progression cannot be empty." };
  }
  if (chords.length > 32) {
    return { valid: false, message: "Maximum progression length is 32 chords." };
  }
  for (let i = 0; i < chords.length; i++) {
    if (!chords[i].name || chords[i].name.trim() === "") {
      return { valid: false, message: `Chord at position ${i + 1} has an invalid name.` };
    }
  }
  return { valid: true };
}

/**
 * Builds an ACE-Step 1.5 prompt string from structured harmonic data.
 */
export function buildAceStepPrompt(req: MusicGenerationRequest): string {
  const chordString = req.progression
    .map((c) => c.name.trim())
    .filter(Boolean)
    .join(" | ");

  const keyStr = req.key || "C Major";
  const bpmVal = req.bpm || 92;
  const style = req.styleOrGenre || "J-Pop";
  const instruments = req.instrumentation && req.instrumentation.length > 0
    ? req.instrumentation.join(", ")
    : "electric piano, warm acoustic bass, crisp drums";

  const parts: string[] = [
    `Short musical sketch, ${style} genre.`,
    `Chord Progression: ${chordString}.`,
    `Key: ${keyStr}.`,
    `Tempo: ${bpmVal} BPM.`,
    `Instrumentation: ${instruments}.`
  ];

  if (req.melodyDescription) {
    parts.push(`Melodic feel: ${req.melodyDescription.trim()}.`);
  }

  if (req.customInstructions) {
    parts.push(`Arrangement details: ${req.customInstructions.trim()}.`);
  }

  return parts.join(" ");
}

/**
 * Prepares the 54-parameter array for Hugging Face ACE-Step `/generation_wrapper` endpoint.
 */
export function buildAceStepGradioParams(req: MusicGenerationRequest, prompt: string): any[] {
  const bpm = req.bpm || 92;
  const keySig = req.key || "C major";
  const timeSigDigits = req.timeSignature ? req.timeSignature.split("/")[0] : "4";
  const duration = req.requestedDurationSeconds || 12; // Short sketch 8-20s (default 12)
  const lyrics = req.lyrics || "";

  return [
    "acestep-v15-xl-turbo", // 0: selected_model
    "custom",               // 1: generation_mode
    "",                     // 2: simple_query_input
    "unknown",              // 3: simple_vocal_language
    prompt,                 // 4: prompt_input
    lyrics,                 // 5: lyrics_input
    bpm,                    // 6: bpm_input
    keySig,                 // 7: key_sig_input
    timeSigDigits,          // 8: time_sig_input
    "unknown",              // 9: vocal_lang_input
    8,                      // 10: dit_steps_input
    7,                      // 11: param_11
    true,                   // 12: random_seed_checkbox
    "-1",                   // 13: seed_input
    null,                   // 14: ref_audio_input
    duration,               // 15: audio_duration_input
    1,                      // 16: batch_size_input
    null,                   // 17: src_audio_input
    "",                     // 18: audio_codes_input
    0,                      // 19: start_time_input
    -1,                     // 20: end_time_input
    "Fill the audio semantic mask based on the given conditions:", // 21: rep_prompt_input
    1,                      // 22: rep_prompt_weight_input
    "text2music",           // 23: task_type_input
    false,                  // 24
    0,                      // 25
    1,                      // 26
    3,                      // 27: shift
    "ode",                  // 28: infer_method_input
    "",                     // 29: custom_timesteps_input
    "mp3",                  // 30: audio_format_input
    0.85,                   // 31: lm_temp_input
    true,                   // 32: thinking_input
    2,                      // 33: lm_cfg_input
    0,                      // 34: top_k_input
    0.9,                    // 35: top_p_input
    "NO USER INPUT",        // 36: lm_neg_prompt_input
    true,                   // 37
    true,                   // 38
    true,                   // 39
    null,                   // 40
    false,                  // 41
    true,                   // 42
    false,                  // 43
    false,                  // 44
    0.5,                    // 45
    8,                      // 46
    null,                   // 47
    [],                     // 48
    false,                  // 49
    null,                   // 50
    null,                   // 51
    null,                   // 52
    null                    // 53
  ];
}
