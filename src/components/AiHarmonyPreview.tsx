import React, { useState } from "react";
import { ChordItem } from "../types";
import { MusicProviderId, MusicGenerationRequest, ProgressUpdate } from "../music/providers/types";
import { musicProviderRegistry } from "../music/providers/providerRegistry";
import { explainHarmonicFunction, HarmonicExplanationResult } from "../music/harmony/HarmonicExplainer";
import { LyriaAudioPlayer } from "./LyriaAudioPlayer";
import { renderProgressionToWav } from "../utils/wavExporter";
import {
  Sparkles,
  Play,
  Music2,
  Sliders,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Volume2,
  Info,
  Clock,
  Key,
  Activity,
  Layers,
  Wand2,
  RotateCcw,
  Cpu,
  Radio,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Headphones,
} from "lucide-react";

interface AiHarmonyPreviewProps {
  chords: ChordItem[];
  keyName: string;
  bpm: number;
  timeSignature: string;
  onExactPlayback?: () => void;
  isPlayingExact?: boolean;
}

const STYLE_PRESETS = [
  { id: "J-Pop", label: "J-Pop Chord Sketch", icon: "🎌", instruments: ["electric piano", "synth bass", "soft drums"] },
  { id: "City Pop", label: "City Pop 80s", icon: "🌆", instruments: ["fender rhodes", "slap bass", "disco drums", "brass"] },
  { id: "Neo Soul", label: "Neo Soul & Chill", icon: "🍷", instruments: ["warm rhodes", "finger bass", "brush drums"] },
  { id: "Lo-Fi", label: "Lo-Fi Hip Hop", icon: "☕", instruments: ["mellow piano", "sub bass", "vinyl crackle drums"] },
  { id: "Jazz", label: "Jazz Quartet", icon: "🎷", instruments: ["upright piano", "walking bass", "ride cymbal"] },
  { id: "Cinematic", label: "Cinematic Orchestral", icon: "🎬", instruments: ["grand piano", "strings section", "timpani"] },
  { id: "EDM", label: "Melodic EDM", icon: "⚡", instruments: ["pluck synth", "saw bass", "four-on-floor drums"] },
];

export const AiHarmonyPreview: React.FC<AiHarmonyPreviewProps> = ({
  chords,
  keyName,
  bpm,
  timeSignature,
  onExactPlayback,
  isPlayingExact = false,
}) => {
  // Provider Selection
  const [selectedProviderId, setSelectedProviderId] = useState<MusicProviderId>("acestep_hf");

  // Style and Generation Options
  const [selectedStyle, setSelectedStyle] = useState<string>("J-Pop");
  const [durationSeconds, setDurationSeconds] = useState<number>(12); // Short sketch 8-20s
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showWhySection, setShowWhySection] = useState(true);

  // Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressState, setProgressState] = useState<ProgressUpdate | null>(null);
  const [audioResult, setAudioResult] = useState<{
    audio?: string;
    mimeType?: string;
    cached?: boolean;
    error?: string;
    promptUsed?: string;
    explanation?: HarmonicExplanationResult;
    providerName?: string;
    isSleeping?: boolean;
  } | null>(null);

  // Harmonic Explanation calculated for current progression
  const harmonicExplanation = explainHarmonicFunction(chords, keyName);

  // Primary Action: "🎧 Hear This Harmony"
  const handleHearThisHarmony = async (overrideProvider?: MusicProviderId) => {
    if (!chords || chords.length === 0) return;

    const providerIdToUse = overrideProvider || selectedProviderId;
    const provider = musicProviderRegistry.getProvider(providerIdToUse);

    if (!provider) {
      setAudioResult({ error: `Selected music provider '${providerIdToUse}' is not registered.` });
      return;
    }

    setIsGenerating(true);
    setAudioResult(null);
    setProgressState({
      stage: "connecting",
      message: `Connecting to ${provider.name}...`,
      percentage: 10,
    });

    const activePreset = STYLE_PRESETS.find((s) => s.id === selectedStyle);

    const req: MusicGenerationRequest = {
      progression: chords,
      key: keyName,
      scaleOrMode: keyName.toLowerCase().includes("minor") ? "minor" : "major",
      bpm,
      timeSignature,
      styleOrGenre: selectedStyle,
      instrumentation: activePreset?.instruments || ["electric piano", "bass", "drums"],
      requestedDurationSeconds: durationSeconds,
      customInstructions: customInstructions.trim() || undefined,
    };

    try {
      const result = await provider.generate(req, (p) => setProgressState(p));

      setIsGenerating(false);

      if (result.success && result.audioBase64) {
        setAudioResult({
          audio: result.audioBase64,
          mimeType: result.mimeType || "audio/mp3",
          cached: result.cached,
          promptUsed: result.promptUsed,
          explanation: harmonicExplanation,
          providerName: result.providerName,
        });
      } else if (result.success && providerIdToUse === "synth_fallback") {
        // Local Synth fallback generation via Wav exporter
        await handleRenderLocalSynthWav();
      } else {
        setAudioResult({
          error: result.error || "Generation request did not return valid audio.",
          isSleeping: result.isSleepingOrQueued,
          providerName: result.providerName,
        });
      }
    } catch (err: any) {
      setIsGenerating(false);
      setAudioResult({
        error: err.message || "An unexpected error occurred during audio generation.",
      });
    }
  };

  // Render Tone.js synth offline fallback
  const handleRenderLocalSynthWav = async () => {
    setIsGenerating(true);
    setProgressState({
      stage: "generating",
      message: "Rendering progression with browser Tone.js synthesizer...",
      percentage: 60,
    });

    try {
      const wavBlob = await renderProgressionToWav(chords, bpm, "piano");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(",")[1];
        setIsGenerating(false);
        setAudioResult({
          audio: base64data,
          mimeType: "audio/wav",
          cached: false,
          explanation: harmonicExplanation,
          providerName: "HarmonicX Synth Fallback (Tone.js)",
        });
      };
      reader.readAsDataURL(wavBlob);
    } catch (e: any) {
      setIsGenerating(false);
      setAudioResult({
        error: "Failed to render offline synth audio: " + (e.message || String(e)),
      });
    }
  };

  return (
    <div className="bg-[#12121a] border border-[#2d2d3d] rounded-2xl p-4 sm:p-6 space-y-6 shadow-2xl">
      {/* Top Hero Banner & Primary CTA */}
      <div className="bg-gradient-to-r from-[#1c1630] via-[#161628] to-[#12121a] border border-[#7c5cbf]/40 rounded-xl p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#7c5cbf]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#7c5cbf] to-[#6366f1] text-white text-[10px] font-black uppercase tracking-wider rounded shadow">
                ⚡ AI Audio Generation Engine
              </span>
              <span className="text-[11px] font-mono text-[#a88beb] font-bold flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                ACE-Step 1.5 DiT ZeroGPU
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Hear Your Harmony in Real AI Audio
            </h2>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Transform your chord progression <span className="text-[#a88beb] font-semibold font-mono">{chords.map(c => c.name).join(" → ")}</span> into a high-fidelity 8–20s musical sketch synthesized by ACE-Step 1.5.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onExactPlayback && (
              <button
                onClick={onExactPlayback}
                className={`px-4 py-3 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                  isPlayingExact
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/20 animate-pulse"
                    : "bg-[#252533] hover:bg-[#323245] text-gray-200 border-[#3d3d52]"
                }`}
                title="Play exact MIDI chord notes with Tone.js"
              >
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Exact MIDI Playback</span>
              </button>
            )}

            <button
              onClick={() => handleHearThisHarmony()}
              disabled={isGenerating || chords.length === 0}
              className="px-6 py-3.5 rounded-xl text-sm font-black bg-gradient-to-r from-[#7c5cbf] via-[#6366f1] to-[#a88beb] hover:from-[#8b68d4] hover:to-[#b79cf4] text-white shadow-xl shadow-[#7c5cbf]/40 transition transform active:scale-95 disabled:opacity-50 flex items-center gap-2.5 cursor-pointer"
            >
              <Headphones className="w-5 h-5 text-amber-300 animate-bounce-slow" />
              <span>{isGenerating ? "Synthesizing..." : "🎧 Hear This Harmony"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Provider Selector Tabs */}
      <div className="bg-[#181824] border border-[#2d2d3d] rounded-xl p-4 space-y-3">
        <label className="text-xs font-black text-white uppercase tracking-wider block flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#a88beb]" /> Select AI Music Provider
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* ACE-Step 1.5 Provider Option */}
          <button
            type="button"
            onClick={() => setSelectedProviderId("acestep_hf")}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
              selectedProviderId === "acestep_hf"
                ? "bg-[#282042] border-[#7c5cbf] text-white ring-2 ring-[#7c5cbf]"
                : "bg-[#12121a] border-[#252533] text-gray-400 hover:bg-[#1a1a28] hover:text-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                ⚡ ACE-Step 1.5
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 font-mono rounded border border-amber-500/30">
                ZeroGPU
              </span>
            </div>
            <p className="text-[11px] text-gray-300 leading-snug">
              Diffusion Transformer model trained on music. Generates short high-fidelity sketches (8–20s).
            </p>
          </button>

          {/* Tone.js Synth Fallback Option */}
          <button
            type="button"
            onClick={() => setSelectedProviderId("synth_fallback")}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
              selectedProviderId === "synth_fallback"
                ? "bg-[#282042] border-[#7c5cbf] text-white ring-2 ring-[#7c5cbf]"
                : "bg-[#12121a] border-[#252533] text-gray-400 hover:bg-[#1a1a28] hover:text-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                🎹 HarmonicX Synth (Offline)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono rounded border border-emerald-500/30">
                0ms Latency
              </span>
            </div>
            <p className="text-[11px] text-gray-300 leading-snug">
              Instant in-browser Web Audio synthesis using HarmonicX SoundFont instruments.
            </p>
          </button>

          {/* Google Lyria Option */}
          <button
            type="button"
            onClick={() => setSelectedProviderId("lyria")}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
              selectedProviderId === "lyria"
                ? "bg-[#282042] border-[#7c5cbf] text-white ring-2 ring-[#7c5cbf]"
                : "bg-[#12121a] border-[#252533] text-gray-400 hover:bg-[#1a1a28] hover:text-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                ✨ Google Lyria AI
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono rounded border border-indigo-500/30">
                Experimental
              </span>
            </div>
            <p className="text-[11px] text-gray-300 leading-snug">
              Google DeepMind Lyria model for harmonic concept preview & reharmonization.
            </p>
          </button>
        </div>
      </div>

      {/* Style & Arrangement Options */}
      <div className="bg-[#181824] border border-[#2d2d3d] rounded-xl p-4 space-y-3">
        <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#a88beb]" /> Select Musical Style & Instrumentation
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedStyle(preset.id)}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                selectedStyle === preset.id
                  ? "bg-[#282042] border-[#7c5cbf] text-white ring-1 ring-[#7c5cbf]"
                  : "bg-[#12121a] border-[#252533] text-gray-300 hover:bg-[#1a1a28]"
              }`}
            >
              <span className="text-lg">{preset.icon}</span>
              <span className="text-xs font-extrabold">{preset.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Progression Timeline Pills (Always Visible) */}
      <div className="bg-[#181824] border border-[#2d2d3d] rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2d2d3d] pb-2.5">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-[#a88beb]" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Active Chord Sequence
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-300">
            Key: {keyName} | {bpm} BPM | {timeSignature}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {chords.map((c, idx) => (
            <div
              key={c.id || idx}
              className="px-3.5 py-2 rounded-xl bg-[#202030] border border-[#3d3d52] font-mono flex flex-col items-center min-w-[70px]"
            >
              <span className="text-xs font-black text-white">{c.name}</span>
              <span className="text-[10px] text-[#a88beb] font-semibold">
                {c.romanNumeral || "I"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Settings Collapsible */}
      <div className="border border-[#2d2d3d] rounded-xl overflow-hidden bg-[#151522]">
        <button
          type="button"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="w-full px-4 py-3 bg-[#181824] hover:bg-[#202030] text-gray-200 text-xs font-extrabold flex items-center justify-between transition border-b border-[#2d2d3d]"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#a88beb]" />
            <span>Generation Parameters (Sketch Duration & Instructions)</span>
          </div>
          {showAdvancedSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvancedSettings && (
          <div className="p-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-300">
                  Sketch Duration ({durationSeconds} seconds)
                </label>
                <input
                  type="range"
                  min={8}
                  max={20}
                  step={2}
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10))}
                  className="w-full accent-[#a88beb] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-300">
                  Custom Arrangement Prompt / Details
                </label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Warm electric piano, syncopated bass, soft vinyl drum groove..."
                  className="w-full bg-[#12121a] border border-[#2d2d3d] text-white text-xs rounded-lg p-2.5 focus:outline-none focus:border-[#7c5cbf] placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress & Queue Status Bar */}
      {isGenerating && (
        <div className="p-4 bg-[#1a162b] border border-[#7c5cbf]/40 rounded-xl space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              {progressState?.message || "Generating audio..."}
            </span>
            <span className="font-mono text-[#a88beb]">{progressState?.percentage || 30}%</span>
          </div>
          <div className="w-full bg-[#0f0f13] h-2 rounded-full overflow-hidden border border-[#2d2d3d]">
            <div
              className="bg-gradient-to-r from-[#7c5cbf] to-[#6366f1] h-full transition-all duration-500"
              style={{ width: `${progressState?.percentage || 30}%` }}
            />
          </div>
        </div>
      )}

      {/* Generated Audio Player & Actions */}
      {!isGenerating && audioResult?.audio && (
        <div className="space-y-4">
          <LyriaAudioPlayer
            audioBase64={audioResult.audio}
            mimeType={audioResult.mimeType || "audio/mp3"}
            isLoading={false}
            title={`ACE-Step Musical Sketch — ${selectedStyle}`}
            badgeLabel={audioResult.providerName || "ACE-Step 1.5"}
            cached={audioResult.cached}
          />

          {/* Quick Action Bar for Result */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181824] p-3 rounded-xl border border-[#2d2d3d]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleHearThisHarmony()}
                className="px-3 py-1.5 bg-[#252533] hover:bg-[#323245] text-white text-xs font-bold rounded-lg border border-[#3d3d52] transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                <span>Regenerate</span>
              </button>

              <button
                onClick={() => setShowAdvancedSettings(true)}
                className="px-3 py-1.5 bg-[#252533] hover:bg-[#323245] text-gray-200 text-xs font-bold rounded-lg border border-[#3d3d52] transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#a88beb]" />
                <span>Change Style</span>
              </button>

              <button
                onClick={() => handleHearThisHarmony("synth_fallback")}
                className="px-3 py-1.5 bg-[#252533] hover:bg-[#323245] text-emerald-300 text-xs font-bold rounded-lg border border-[#3d3d52] transition flex items-center gap-1.5 cursor-pointer"
              >
                <Music2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fallback to Synth</span>
              </button>
            </div>

            <button
              onClick={() => setShowWhySection(!showWhySection)}
              className="text-xs font-bold text-[#a88beb] hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showWhySection ? "Hide Harmonic Explanation" : "Why does it sound like this?"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Error & Fallback Banner */}
      {!isGenerating && audioResult?.error && (
        <div className="p-4 bg-[#23151b] border border-rose-500/40 rounded-xl space-y-3">
          <div className="flex items-start gap-2.5 text-rose-200 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-white text-xs">AI Music Generation Unavailable</p>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">{audioResult.error}</p>
              <p className="text-[10px] text-gray-400">
                ACE-Step Hugging Face Space may be waking up or queued. You can fall back to HarmonicX local synth instantly.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-500/20">
            <button
              onClick={() => handleHearThisHarmony("synth_fallback")}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Use HarmonicX Local Synth (Tone.js)</span>
            </button>

            <button
              onClick={() => handleHearThisHarmony("acestep_hf")}
              className="px-3 py-1.5 bg-[#2a2a3b] hover:bg-[#38384f] text-gray-200 text-xs font-bold rounded-lg border border-[#44445c] transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry ACE-Step</span>
            </button>
          </div>
        </div>
      )}

      {/* Educational "Why does it sound like this?" Harmonic Function Section */}
      {showWhySection && harmonicExplanation && (
        <div className="bg-[#161622] border border-[#2d2d3d] rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2d2d3d] pb-2.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Why does it sound like this? (Harmonic Function Analysis)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
              Mood: {harmonicExplanation.overallMood}
            </span>
          </div>

          {/* Explanation Text */}
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            {harmonicExplanation.harmonicAnalysisText}
          </p>

          {/* Functional Roles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
            {harmonicExplanation.functionalRoles.map((role, idx) => (
              <div key={idx} className="p-2.5 bg-[#12121a] rounded-lg border border-[#252533] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{role.chord}</span>
                  <span className="text-[10px] font-mono text-[#a88beb] font-bold">{role.roman}</span>
                </div>
                <p className="text-[10px] font-semibold text-amber-300">{role.role}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{role.explanation}</p>
              </div>
            ))}
          </div>

          {/* Voice Leading Tip */}
          {harmonicExplanation.suggestedVoiceLeadingNote && (
            <div className="p-2.5 bg-[#12121a] rounded-lg border border-[#252533] text-[11px] text-gray-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{harmonicExplanation.suggestedVoiceLeadingNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
