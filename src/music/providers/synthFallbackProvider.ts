import { MusicProvider, MusicGenerationRequest, MusicGenerationResult, ProgressUpdate } from "./types";
import { explainHarmonicFunction } from "../harmony/HarmonicExplainer";

export class SynthFallbackProvider implements MusicProvider {
  public id = "synth_fallback" as const;
  public name = "HarmonicX Synth Fallback (Tone.js / Web Audio)";
  public description = "Browser-based offline synthesis for instant chord progression auditioning with zero network latency.";
  public isCloudProvider = false;

  public async isAvailable(): Promise<boolean> {
    return true; // Always available client-side
  }

  public async generate(
    request: MusicGenerationRequest,
    onProgress?: (update: ProgressUpdate) => void
  ): Promise<MusicGenerationResult> {
    if (onProgress) {
      onProgress({
        stage: "generating",
        message: "Rendering chord progression with Tone.js browser synthesizer...",
        percentage: 50,
      });
    }

    const keyName = request.key || "C Major";
    const explanation = explainHarmonicFunction(request.progression, keyName);

    if (onProgress) {
      onProgress({
        stage: "complete",
        message: "Tone.js synth sequence ready!",
        percentage: 100,
      });
    }

    return {
      success: true,
      providerId: this.id,
      providerName: this.name,
      audioBase64: undefined, // Uses live Web Audio / Tone.js playback
      promptUsed: `Tone.js Synth: ${request.progression.map(c => c.name).join(" - ")} (${keyName}, ${request.bpm || 92} BPM)`,
      harmonicFunctionExplanation: explanation.harmonicAnalysisText,
      explanationDetails: explanation,
    };
  }
}

export const synthFallbackProvider = new SynthFallbackProvider();
