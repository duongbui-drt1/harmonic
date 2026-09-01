import { MusicProvider, MusicGenerationRequest, MusicGenerationResult, ProgressUpdate } from "./types";
import { validateChordProgression } from "./aceStepPromptBuilder";

export class AceStepProvider implements MusicProvider {
  public id = "acestep_hf" as const;
  public name = "ACE-Step (Hugging Face ZeroGPU)";
  public description = "Generates high-fidelity short musical sketches (8-20s) using ACE-Step 1.5 DiT architecture on Hugging Face ZeroGPU.";
  public isCloudProvider = true;

  public async isAvailable(): Promise<boolean> {
    return true; // Cloud route available on backend server
  }

  public async generate(
    request: MusicGenerationRequest,
    onProgress?: (update: ProgressUpdate) => void,
    signal?: AbortSignal
  ): Promise<MusicGenerationResult> {
    // 1. Validate progression
    const val = validateChordProgression(request.progression);
    if (!val.valid) {
      return {
        success: false,
        providerId: this.id,
        providerName: this.name,
        error: val.message || "Invalid chord progression.",
      };
    }

    if (onProgress) {
      onProgress({
        stage: "connecting",
        message: "Connecting to ACE-Step 1.5 on Hugging Face ZeroGPU...",
        percentage: 15,
      });
    }

    try {
      if (onProgress) {
        onProgress({
          stage: "generating",
          message: "ACE-Step is synthesizing audio for your chord progression...",
          percentage: 45,
        });
      }

      const response = await fetch("/api/acestep/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal,
      });

      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();
      let data: any = {};
      try {
        if (contentType.includes("application/json") || !text.trim().startsWith("<")) {
          data = JSON.parse(text);
        }
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        const errorMsg =
          data.error ||
          (text.trim().startsWith("<")
            ? "ACE-Step server endpoint is only available when running the Node.js backend. Fallback synthesizer is ready to play your chords!"
            : `ACE-Step provider failed with status ${response.status}.`);
        return {
          success: false,
          providerId: this.id,
          providerName: this.name,
          error: errorMsg,
          isSleepingOrQueued: !!data.isSleepingOrQueued,
        };
      }

      if (onProgress) {
        onProgress({
          stage: "complete",
          message: "Musical sketch ready!",
          percentage: 100,
        });
      }

      return {
        success: true,
        providerId: this.id,
        providerName: this.name,
        audioBase64: data.audio,
        mimeType: data.mimeType || "audio/mp3",
        promptUsed: data.promptUsed,
        cached: !!data.cached,
        harmonicFunctionExplanation: data.harmonicFunctionExplanation,
        lyrics: data.lyrics,
      };
    } catch (err: any) {
      if (err.name === "AbortError") {
        return {
          success: false,
          providerId: this.id,
          providerName: this.name,
          error: "ACE-Step music generation was cancelled.",
        };
      }
      return {
        success: false,
        providerId: this.id,
        providerName: this.name,
        error: err.message || "Unable to reach ACE-Step generation endpoint.",
      };
    }
  }
}

export const aceStepProvider = new AceStepProvider();
