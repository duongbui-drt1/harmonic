import React, { useState, useEffect } from "react";
import { ChordItem, AIAnalysisResult, AIGenerationResult } from "../types";
import { parseChordName, getChordNotes } from "../utils/chordData";
import {
  generateChordProgressionAI,
  analyzeChordProgressionAI,
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
} from "../services/geminiClientService";
import {
  Sparkles,
  Loader2,
  Play,
  Activity,
  Music,
  Tag,
  Compass,
  FileText,
  Key,
  Check,
  Info,
} from "lucide-react";

interface AIAssistantProps {
  currentChords?: ChordItem[];
  chords?: ChordItem[];
  currentKey?: string;
  keyName?: string;
  currentBpm?: number;
  bpm?: number;
  onLoadAIGenerated?: (chords: ChordItem[], key: string, explanation: string) => void;
  onApplySuggestion?: (chords: ChordItem[], key?: string, explanation?: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  currentChords,
  chords,
  currentKey,
  keyName,
  currentBpm,
  bpm,
  onLoadAIGenerated,
  onApplySuggestion,
}) => {
  const activeChords = chords || currentChords || [];
  const activeKey = keyName || currentKey || "C Major";
  const activeBpm = bpm || currentBpm || 120;
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generationResult, setGenerationResult] = useState<AIGenerationResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [resultSource, setResultSource] = useState<"server" | "gemini_client" | "algorithmic" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Gemini API Key config toggle for GitHub Pages client-side mode
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  useEffect(() => {
    setApiKeyInput(getStoredGeminiApiKey());
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredGeminiApiKey(apiKeyInput);
    setSavedKeySuccess(true);
    setTimeout(() => {
      setSavedKeySuccess(false);
      setShowKeyModal(false);
    }, 1200);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setGenerationResult(null);

    try {
      const res = await generateChordProgressionAI(prompt);
      setGenerationResult(res.result);
      setResultSource(res.source);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during AI generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (activeChords.length === 0) {
      setErrorMsg("Timeline is empty. Please add some chords before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await analyzeChordProgressionAI(activeChords, activeKey, activeBpm);
      setAnalysisResult(res.result);
      setResultSource(res.source);
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

    if (onApplySuggestion) {
      onApplySuggestion(chordsToLoad, generationResult.key, generationResult.explanation);
    } else if (onLoadAIGenerated) {
      onLoadAIGenerated(chordsToLoad, generationResult.key, generationResult.explanation);
    }
  };

  const hasConfiguredApiKey = !!getStoredGeminiApiKey();

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#2d2d3d]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block">
              Trợ Lý Trí Tuệ Nhân Tạo
            </span>
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-[10px] rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" /> Google Gemini AI
            </span>
            <button
              onClick={() => setShowKeyModal(!showKeyModal)}
              className="px-2 py-0.5 bg-[#252533] hover:bg-[#323245] text-gray-300 border border-[#3d3d52] text-[10px] rounded-full flex items-center gap-1 transition"
              title="Cài đặt API Key Gemini khi chạy trên GitHub Pages"
            >
              <Key className="w-2.5 h-2.5 text-amber-400" />
              {hasConfiguredApiKey ? "API Key: Đã lưu" : "Cấu hình API Key"}
            </button>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            AI Phân Tích & Sáng Tác Hòa Âm
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Mô tả ý tưởng, thể loại hoặc cảm xúc để AI tự động sáng tác vòng hợp âm phù hợp, hoặc phân tích lý thuyết vòng hợp âm hiện tại.
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || activeChords.length === 0}
          aria-label="Phân tích lý thuyết vòng hợp âm hiện tại bằng Google Gemini AI"
          className="px-3.5 py-2 bg-[#252533] hover:bg-[#323245] text-[#a88beb] border border-[#3d3d52] text-xs font-bold uppercase rounded-lg flex items-center gap-2 disabled:opacity-40 transition shadow-sm"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Activity className="w-4 h-4" />
          )}
          Phân Tích Vòng Hiện Tại
        </button>
      </div>

      {/* API Key Modal / Drawer for GitHub Pages users */}
      {showKeyModal && (
        <form
          onSubmit={handleSaveApiKey}
          className="bg-[#12121a] border border-indigo-500/40 p-4 rounded-xl space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" /> Cài Đặt Khóa Gemini API (Tùy chọn)
            </span>
            <button
              type="button"
              onClick={() => setShowKeyModal(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            Khi chạy trên <strong>GitHub Pages (Static Web)</strong>, bạn có thể dán khóa <code>GEMINI_API_KEY</code> miễn phí từ Google AI Studio để gọi trực tiếp mô hình Gemini từ trình duyệt. Khóa sẽ được lưu an toàn trong <code>localStorage</code> của bạn. Nếu để trống, hệ thống sẽ tự động sử dụng <strong>Bộ Tạo Hòa Âm Nhạc Lý Tích Hợp</strong>!
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Dán AI Studio Gemini API Key (AIzaSy...)"
              className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-[#3d3d52] rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center gap-1 transition"
            >
              {savedKeySuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-300" /> Đã Lưu
                </>
              ) : (
                "Lưu Khóa"
              )}
            </button>
          </div>
        </form>
      )}

      {/* AI Prompt Input Form */}
      <form onSubmit={handleGenerate} className="space-y-3" role="search" aria-label="Khung nhập mô tả sáng tác AI">
        <label htmlFor="ai-prompt-input" className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
          Mô tả ý tưởng bài hát / tâm trạng bạn muốn tạo:
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            id="ai-prompt-input"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            aria-label="Mô tả ý tưởng âm nhạc cho AI"
            placeholder='Ví dụ: "Vòng hòa âm mưa buồn đêm khuya C Cải lương", "Điệp khúc J-pop sôi động", "Chachacha sôi động A minor"...'
            className="flex-1 px-3.5 py-2.5 bg-[#0f0f13] border border-[#3d3d52] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#7c5cbf]"
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            aria-label="Gửi yêu cầu sáng tác đến Google Gemini AI"
            className="px-5 py-2.5 bg-gradient-to-r from-[#7c5cbf] to-indigo-600 hover:from-[#8e6fd1] hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Đang Sáng Tác...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" /> Sáng Tác Bằng Gemini
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#a88beb] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Kết Quả Sáng Tác AI
              </span>
              {resultSource && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                  {resultSource === "gemini_client"
                    ? "✨ Gemini Direct (In-Browser)"
                    : resultSource === "server"
                    ? "✨ Gemini Cloud Server"
                    : "⚡ Smart Harmonic Engine"}
                </span>
              )}
            </div>
            <span className="text-xs font-mono font-bold text-gray-400">
              Key: {generationResult.key} ({generationResult.mode})
            </span>
          </div>

          <div className="text-sm font-bold text-white tracking-wide font-mono bg-[#1a1a24] p-3 rounded border border-[#2d2d3d]">
            {generationResult.chords.map((c) => `${c.name} (${c.beats}b)`).join(" -> ")}
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">{generationResult.explanation}</p>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#2d2d3d]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                Mood: {generationResult.mood}
              </span>
            </div>

            <button
              onClick={applyAIGeneratedChords}
              className="px-4 py-1.5 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 shadow-md transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Đưa Vào Timeline
            </button>
          </div>
        </div>
      )}

      {/* AI Analysis Result Display */}
      {analysisResult && (
        <div className="bg-[#0f0f13] border border-[#2d2d3d] p-5 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#2d2d3d] pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#7c5cbf]" /> Phân Tích Lý Thuyết Vòng Hợp Âm
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
                <Tag className="w-3.5 h-3.5 text-[#7c5cbf]" /> Sắc Thái & Cảm Xúc
              </div>
              <div className="text-gray-200">{analysisResult.emotionalCharacter}</div>
            </div>

            <div className="bg-[#1a1a24] p-3 rounded border border-[#2d2d3d] space-y-1">
              <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#7c5cbf]" /> Hướng Dẫn Soạn Giai Điệu (Melody)
              </div>
              <div className="text-gray-300 leading-relaxed">{analysisResult.suggestedMelodyDirection}</div>
            </div>

            <div className="bg-[#1a1a24] p-3 rounded border border-[#2d2d3d] space-y-1">
              <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#7c5cbf]" /> Nhận Định Hòa Âm
              </div>
              <div className="text-gray-300 leading-relaxed">{analysisResult.harmonicInsights}</div>
            </div>
          </div>

          {/* Genre Fit & Lyric Mood Badges */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[#2d2d3d] text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Thể Loại Phù Hợp:</span>
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
