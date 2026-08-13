import React, { useState } from "react";
import { ChordItem, AIAnalysisResult, AIGenerationResult } from "../types";
import { parseChordName, getChordNotes } from "../utils/chordData";
import { Sparkles, Loader2, Play, Activity, Music, Tag, Compass, FileText } from "lucide-react";

interface AIAssistantProps {
  currentChords: ChordItem[];
  currentKey: string;
  currentBpm: number;
  onLoadAIGenerated: (chords: ChordItem[], key: string, explanation: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  currentChords,
  currentKey,
  currentBpm,
  onLoadAIGenerated,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generationResult, setGenerationResult] = useState<AIGenerationResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setGenerationResult(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate chord progression");
      }

      const data: AIGenerationResult = await res.json();
      setGenerationResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during AI generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (currentChords.length === 0) {
      setErrorMsg("Timeline is empty. Please add some chords before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progression: currentChords.map((c) => ({ name: c.name, beats: c.beats })),
          key: currentKey,
          bpm: currentBpm,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to analyze progression");
      }

      const data: AIAnalysisResult = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during AI analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAIGeneratedChords = () => {
    if (!generationResult) return;

    const chordsToLoad: ChordItem[] = generationResult.chords.map((c) => {
      const parsed = parseChordName(c.name);
      const root = parsed ? parsed.root : "C";
      const intervals = parsed ? parsed.qualityDef.intervals : [0, 4, 7];
      const { noteNames, midiNotes } = getChordNotes(root, intervals, 3);

      return {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: c.name,
        root,
        quality: parsed ? parsed.qualityDef.quality : "major",
        beats: c.beats || 4,
        notes: noteNames,
        midiNotes,
      };
    });

    onLoadAIGenerated(chordsToLoad, generationResult.key, generationResult.explanation);
  };

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#2d2d3d]">
        <div>
          <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-1">
            AI Assistant & Analyzer
          </label>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            AI Music Composer
          </h2>
          <p className="text-xs text-gray-400">
            Describe a mood, style, or story to compose a custom progression, or analyze your current timeline.
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || currentChords.length === 0}
          className="px-3.5 py-1.5 bg-[#252533] hover:bg-[#323245] text-[#a88beb] border border-[#3d3d52] text-xs font-bold uppercase rounded flex items-center gap-2 disabled:opacity-40 transition"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Activity className="w-4 h-4" />
          )}
          Analyze My Progression
        </button>
      </div>

      {/* AI Prompt Input Form */}
      <form onSubmit={handleGenerate} className="space-y-3">
        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
          Describe what you want to compose:
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g., "a sad rainy night progression", "upbeat J-pop chorus", "jazz turnaround in Dm"...'
            className="flex-1 px-3.5 py-2 bg-[#0f0f13] border border-[#3d3d52] rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#7c5cbf]"
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="px-5 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Composing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate
              </>
            )}
          </button>
        </div>
      </form>

      {errorMsg && (
        <p className="text-xs text-red-300 bg-red-950/40 border border-red-800/50 p-3 rounded">
          {errorMsg}
        </p>
      )}

      {/* AI Generation Result Display */}
      {generationResult && (
        <div className="bg-[#0f0f13] border border-[#7c5cbf] p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#a88beb] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Composition Result
            </span>
            <span className="text-xs font-mono font-bold text-gray-400">Key: {generationResult.key} ({generationResult.mode})</span>
          </div>

          <div className="text-sm font-bold text-white tracking-wide font-mono bg-[#1a1a24] p-3 rounded border border-[#2d2d3d]">
            {generationResult.chords.map((c) => `${c.name} (${c.beats}b)`).join(" -> ")}
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">{generationResult.explanation}</p>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#2d2d3d]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Mood: {generationResult.mood}</span>
            </div>

            <button
              onClick={applyAIGeneratedChords}
              className="px-4 py-1.5 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 shadow-md transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Load into Timeline
            </button>
          </div>
        </div>
      )}

      {/* AI Analysis Result Display */}
      {analysisResult && (
        <div className="bg-[#0f0f13] border border-[#2d2d3d] p-5 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#2d2d3d] pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#7c5cbf]" /> Progression Theoretical Analysis
            </h3>
            <span className="text-xs font-mono font-bold text-[#a88beb]">{analysisResult.key}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#1a1a24] p-3 rounded border border-[#2d2d3d] space-y-1">
              <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-[#7c5cbf]" /> Roman Numeral Analysis
              </div>
              <div className="text-sm font-mono font-bold text-[#a88beb]">
                {analysisResult.romanAnalysis}
              </div>
            </div>

            <div className="bg-[#1a1a24] p-3 rounded border border-[#2d2d3d] space-y-1">
              <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#7c5cbf]" /> Emotional Character
              </div>
              <div className="text-gray-200">{analysisResult.emotionalCharacter}</div>
            </div>

            <div className="bg-[#1a1a24] p-3 rounded border border-[#2d2d3d] space-y-1">
              <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#7c5cbf]" /> Suggested Melody Direction
              </div>
              <div className="text-gray-300 leading-relaxed">{analysisResult.suggestedMelodyDirection}</div>
            </div>

            <div className="bg-[#1a1a24] p-3 rounded border border-[#2d2d3d] space-y-1">
              <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#7c5cbf]" /> Harmonic Insights
              </div>
              <div className="text-gray-300 leading-relaxed">{analysisResult.harmonicInsights}</div>
            </div>
          </div>

          {/* Genre Fit & Lyric Mood Badges */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[#2d2d3d] text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Genre Fit:</span>
              {analysisResult.genreFit?.map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 bg-[#252533] border border-[#3d3d52] text-[#a88beb] rounded text-xs font-mono font-bold"
                >
                  {g}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Lyric Mood:</span>
              {analysisResult.lyricMoodKeywords?.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 bg-[#252533] border border-[#3d3d52] text-gray-300 rounded font-mono text-xs"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
