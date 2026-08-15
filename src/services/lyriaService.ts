import { HarmonicPreviewContext, LyriaAudioResult } from "../music/lyria/lyriaTypes";

class LyriaService {
  private cache: Map<string, LyriaAudioResult> = new Map();

  /**
   * Generates a stable cache key based on the harmonic context.
   */
  public getCacheKey(context: HarmonicPreviewContext): string {
    const progStr = context.progression.map((c) => `${c.name}:${c.beats || 4}`).join(",");
    const reharmStr = context.reharmonizedProgression
      ? context.reharmonizedProgression.map((c) => c.name).join(",")
      : "";
    
    return [
      context.previewMode,
      context.key,
      context.mode,
      context.bpm,
      context.timeSignature,
      context.genre || "default",
      context.selectedChord?.name || "none",
      context.chordContextMode || "none",
      context.isReharmonizedVariant ? "reharmonized" : "original",
      progStr,
      reharmStr,
      context.durationSeconds || 15,
      context.customInstructions || "",
    ].join("|");
  }

  /**
   * Generates or fetches cached audio preview for a given harmonic context.
   */
  public async generatePreview(
    context: HarmonicPreviewContext,
    signal?: AbortSignal
  ): Promise<LyriaAudioResult> {
    const key = this.getCacheKey(context);

    // Return cached audio if available
    if (this.cache.has(key)) {
      const cached = this.cache.get(key)!;
      return { ...cached, cached: true };
    }

    try {
      const response = await fetch("/api/lyria/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(context),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Generation failed with status ${response.status}`;
        return {
          success: false,
          error: errorMessage,
          isQuotaError: !!errorData.isQuotaError,
          previewMode: context.previewMode,
        };
      }

      const result: LyriaAudioResult = await response.json();

      if (result.success && result.audio) {
        this.cache.set(key, result);
      }

      return result;
    } catch (err: any) {
      if (err.name === "AbortError") {
        return {
          success: false,
          error: "Audio generation request cancelled.",
          previewMode: context.previewMode,
        };
      }
      return {
        success: false,
        error: err.message || "Failed to reach Lyria generation server endpoint.",
        previewMode: context.previewMode,
      };
    }
  }

  /**
   * Clears in-memory generation cache.
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export const lyriaService = new LyriaService();
