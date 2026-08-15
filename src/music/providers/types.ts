import { ChordItem } from "../../types";

export type MusicProviderId = "acestep_hf" | "lyria" | "synth_fallback";

export interface MusicGenerationRequest {
  progression: ChordItem[];
  key: string;               // e.g. "C Major" or "A Minor"
  scaleOrMode: string;       // e.g. "major" or "minor"
  bpm: number;               // e.g. 92
  timeSignature?: string;    // e.g. "4/4"
  styleOrGenre?: string;     // e.g. "J-Pop", "City Pop", "Neo Soul", "Lo-Fi", "Jazz"
  instrumentation?: string[];// e.g. ["electric piano", "warm bass", "soft drums"]
  melodyDescription?: string;// e.g. "Gentle, soaring pentatonic motif"
  lyrics?: string;           // Optional lyrics
  requestedDurationSeconds?: number; // Default ~12 seconds (short musical sketch)
  previewMode?: "pure_harmony" | "styled_preview" | "reharmonization" | "chord_understanding";
  customInstructions?: string;
}

export interface ProgressUpdate {
  stage: "connecting" | "queue" | "generating" | "downloading" | "complete" | "error";
  queuePosition?: number;
  etaSeconds?: number;
  message: string;
  percentage?: number;
}

export interface MusicGenerationResult {
  success: boolean;
  providerId: MusicProviderId;
  providerName: string;
  audioUrl?: string;
  audioBase64?: string;
  mimeType?: string;
  promptUsed?: string;
  cached?: boolean;
  error?: string;
  isSleepingOrQueued?: boolean;
  isQuotaError?: boolean;
  harmonicFunctionExplanation?: string;
  explanationDetails?: any;
  lyrics?: string;
}

export interface MusicProvider {
  id: MusicProviderId;
  name: string;
  description: string;
  isCloudProvider: boolean;
  
  generate(
    request: MusicGenerationRequest,
    onProgress?: (update: ProgressUpdate) => void,
    signal?: AbortSignal
  ): Promise<MusicGenerationResult>;

  isAvailable(): Promise<boolean>;
}
