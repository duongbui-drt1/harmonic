import React, { useState } from "react";
import { ChordItem } from "../types";
import { LyriaAudioPlayer } from "./LyriaAudioPlayer";
import { lyriaService } from "../services/lyriaService";
import { createHarmonicPreviewContext } from "../music/lyria/lyriaAnalysisContext";
import { analyzeRomanNumeralAdvanced } from "../music/harmony/RomanAnalysis";
import { renderProgressionToWav } from "../utils/wavExporter";
import { ArrowRight, Wand2, Sparkles, HelpCircle, BookOpen, Layers } from "lucide-react";

interface LyriaComparisonProps {
  originalChords: ChordItem[];
  reharmonizedChords: Array<{ name: string; beats?: number }>;
  keyName: string;
  bpm: number;
  timeSignature: string;
  genreId?: string;
}

export const LyriaComparison: React.FC<LyriaComparisonProps> = ({
  originalChords,
  reharmonizedChords,
  keyName,
  bpm,
  timeSignature,
  genreId,
}) => {
  const [activeTab, setActiveTab] = useState<"A" | "B">("A");
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [audioA, setAudioA] = useState<{ audio?: string; mimeType?: string; cached?: boolean; error?: string } | null>(null);
  const [audioB, setAudioB] = useState<{ audio?: string; mimeType?: string; cached?: boolean; error?: string } | null>(null);
  const [showBeginnerMode, setShowBeginnerMode] = useState(true);

  const keyParts = keyName.split(" ");
  const keyRoot = keyParts[0] || "C";
  const keyMode = keyParts[1]?.toLowerCase() === "minor" ? "minor" : "major";

  // Generate Audio for A (Original)
  const handleGenerateA = async () => {
    setLoadingA(true);
    const ctx = createHarmonicPreviewContext({
      chords: originalChords,
      keyName,
      bpm,
      timeSignature,
      previewMode: "reharmonization",
      genreId,
    });
    ctx.isReharmonizedVariant = false;

    const res = await lyriaService.generatePreview(ctx);
    setLoadingA(false);
    if (res.success && res.audio) {
      setAudioA({ audio: res.audio, mimeType: res.mimeType, cached: res.cached });
    } else {
      setAudioA({ error: res.error || "Failed to generate Original audio" });
    }
  };

  const handleSynthesizeA = async () => {
    setLoadingA(true);
    try {
      const wavBlob = await renderProgressionToWav(originalChords, bpm, "piano");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(",")[1];
        setLoadingA(false);
        setAudioA({ audio: base64data, mimeType: "audio/wav", cached: false });
      };
      reader.readAsDataURL(wavBlob);
    } catch (e: any) {
      setLoadingA(false);
      setAudioA({ error: "Không thể render offline A: " + (e.message || String(e)) });
    }
  };

  // Generate Audio for B (Reharmonized)
  const handleGenerateB = async () => {
    setLoadingB(true);
    const ctx = createHarmonicPreviewContext({
      chords: originalChords,
      keyName,
      bpm,
      timeSignature,
      previewMode: "reharmonization",
      genreId,
    });
    ctx.isReharmonizedVariant = true;

    const res = await lyriaService.generatePreview(ctx);
    setLoadingB(false);
    if (res.success && res.audio) {
      setAudioB({ audio: res.audio, mimeType: res.mimeType, cached: res.cached });
    } else {
      setAudioB({ error: res.error || "Failed to generate Reharmonized audio" });
    }
  };

  const handleSynthesizeB = async () => {
    setLoadingB(true);
    try {
      const reharmChordItems: ChordItem[] = reharmonizedChords.map((c, i) => ({
        id: `reharm-${i}`,
        name: c.name,
        beats: c.beats || 4,
      }));
      const wavBlob = await renderProgressionToWav(reharmChordItems, bpm, "piano");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(",")[1];
        setLoadingB(false);
        setAudioB({ audio: base64data, mimeType: "audio/wav", cached: false });
      };
      reader.readAsDataURL(wavBlob);
    } catch (e: any) {
      setLoadingB(false);
      setAudioB({ error: "Không thể render offline B: " + (e.message || String(e)) });
    }
  };

  // Build theory explanations for changes
  const explanations = originalChords.map((orig, i) => {
    const reharm = reharmonizedChords[i];
    if (!reharm || orig.name === reharm.name) {
      return {
        orig: orig.name,
        reharm: reharm?.name || orig.name,
        changed: false,
        simpleText: "Giữ nguyên hợp âm gốc.",
        theoryText: "Chủ âm / Hòa âm thành phần đồng dạng.",
      };
    }

    const origRoman = analyzeRomanNumeralAdvanced(orig.name, keyRoot, keyMode);
    const reharmRoman = analyzeRomanNumeralAdvanced(reharm.name, keyRoot, keyMode);

    let simpleText = `Thay ${orig.name} thành ${reharm.name} để gia tăng màu sắc.`;
    let theoryText = `Chuyển biến hòa âm từ ${origRoman.roman} sang ${reharmRoman.roman}.`;

    if (reharm.name.includes("maj7") || reharm.name.includes("maj9")) {
      simpleText = "Bổ sung quãng 7 Trưởng rực rỡ, giúp câu nhạc thêm mềm mại và mơ mộng.";
      theoryText = "Thêm bậc mở rộng Upper Extension (Major 7th / Major 9th color).";
    } else if (reharm.name.includes("7") && !reharm.name.includes("maj7")) {
      simpleText = "Dùng hợp âm Át phụ cuốn hút, tạo lực đẩy mạnh mẽ về hợp âm sau.";
      theoryText = `Secondary Dominant (${reharmRoman.roman}) tạo sức hút giải kết.`;
    } else if (reharm.name.includes("m6") || reharm.name.includes("m7") || reharm.name.includes("b")) {
      simpleText = "Mượn màu sắc hòa âm dịu buồn từ giọng Thứ song song.";
      theoryText = "Modal Interchange / Borrowed Chord từ điệu tính song song.";
    } else if (reharm.name.includes("/")) {
      simpleText = "Đảo ngón nốt Bass từng bước nhỏ rải mượt mà.";
      theoryText = "Inversion / Slash Bass Stepwise voice leading.";
    }

    return {
      orig: orig.name,
      reharm: reharm.name,
      changed: true,
      simpleText,
      theoryText,
    };
  });

  return (
    <div className="bg-[#14141f] border border-[#2d2d3d] rounded-xl p-4 space-y-4 shadow-xl">
      {/* Header & A/B Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2d2d3d] pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-[#a88beb]" />
            So Sánh Hòa Âm A/B (Reharmonization Preview)
          </h3>
          <p className="text-[11px] text-gray-400">
            Nghe sự khác biệt giữa hòa âm gốc (Original) và hòa âm biến tấu nâng cao (Reharmonized).
          </p>
        </div>

        {/* Beginner vs Theory Toggle */}
        <button
          onClick={() => setShowBeginnerMode(!showBeginnerMode)}
          className="px-2.5 py-1 bg-[#252533] hover:bg-[#323245] border border-[#3d3d52] text-xs font-bold text-gray-300 rounded-lg transition flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>{showBeginnerMode ? "Ngôn Ngữ Dễ Hiểu" : "Thuật Ngữ Lý Thuyết"}</span>
        </button>
      </div>

      {/* Progression Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Version A Card */}
        <div
          className={`p-3.5 rounded-xl border transition ${
            activeTab === "A"
              ? "bg-[#1c182c] border-[#7c5cbf] ring-1 ring-[#7c5cbf]"
              : "bg-[#181824] border-[#2d2d3d]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              A — Original (Nguyên Bản)
            </span>
            <button
              onClick={() => setActiveTab("A")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                activeTab === "A" ? "bg-[#7c5cbf] text-white" : "bg-[#252533] text-gray-400"
              }`}
            >
              Xem A
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs font-bold text-white mb-3">
            {originalChords.map((c, idx) => (
              <React.Fragment key={idx}>
                <span className="px-2 py-1 bg-[#252533] rounded border border-[#3d3d52]">{c.name}</span>
                {idx < originalChords.length - 1 && <span className="text-gray-500">→</span>}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={handleGenerateA}
            disabled={loadingA}
            className="w-full py-2 bg-[#252533] hover:bg-[#323245] text-indigo-200 text-xs font-bold rounded-lg border border-[#3d3d52] transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#a88beb]" />
            <span>{loadingA ? "Đang tạo âm thanh A..." : "✨ Generate Original (A)"}</span>
          </button>
        </div>

        {/* Version B Card */}
        <div
          className={`p-3.5 rounded-xl border transition ${
            activeTab === "B"
              ? "bg-[#1c182c] border-[#7c5cbf] ring-1 ring-[#7c5cbf]"
              : "bg-[#181824] border-[#2d2d3d]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[#a88beb] uppercase tracking-wider flex items-center gap-1">
              B — Reharmonized (Biến Thể)
            </span>
            <button
              onClick={() => setActiveTab("B")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                activeTab === "B" ? "bg-[#7c5cbf] text-white" : "bg-[#252533] text-gray-400"
              }`}
            >
              Xem B
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs font-bold text-[#a88beb] mb-3">
            {reharmonizedChords.map((c, idx) => (
              <React.Fragment key={idx}>
                <span className="px-2 py-1 bg-[#221c38] rounded border border-[#7c5cbf]/40">{c.name}</span>
                {idx < reharmonizedChords.length - 1 && <span className="text-gray-500">→</span>}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={handleGenerateB}
            disabled={loadingB}
            className="w-full py-2 bg-gradient-to-r from-[#7c5cbf] to-[#6366f1] hover:from-[#8b68d4] hover:to-[#7173f2] text-white text-xs font-bold rounded-lg shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{loadingB ? "Đang tạo âm thanh B..." : "✨ Generate Reharmonized (B)"}</span>
          </button>
        </div>
      </div>

      {/* Active Audio Player */}
      <div className="pt-2">
        {activeTab === "A" && (
          <LyriaAudioPlayer
            audioBase64={audioA?.audio}
            mimeType={audioA?.mimeType}
            isLoading={loadingA}
            error={audioA?.error}
            onRetry={handleGenerateA}
            onSynthesizeFallback={handleSynthesizeA}
            title="Đang Nghe: A — Original Progression"
            badgeLabel="Original AI Preview"
            cached={audioA?.cached}
          />
        )}

        {activeTab === "B" && (
          <LyriaAudioPlayer
            audioBase64={audioB?.audio}
            mimeType={audioB?.mimeType}
            isLoading={loadingB}
            error={audioB?.error}
            onRetry={handleGenerateB}
            onSynthesizeFallback={handleSynthesizeB}
            title="Đang Nghe: B — Reharmonized Progression"
            badgeLabel="Reharmonized AI Preview"
            cached={audioB?.cached}
          />
        )}
      </div>

      {/* "What Changed?" Theory Breakdown */}
      <div className="bg-[#101018] border border-[#252533] rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          Điều Gì Đã Thay Đổi? (What Changed?)
        </h4>

        <div className="space-y-2">
          {explanations.map((exp, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                exp.changed
                  ? "bg-[#181628] border-[#7c5cbf]/40 text-gray-200"
                  : "bg-[#14141f] border-[#222230] text-gray-400"
              }`}
            >
              <div className="flex items-center gap-2 font-mono font-bold shrink-0">
                <span className="px-2 py-0.5 bg-[#252533] text-gray-200 rounded">{exp.orig}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#a88beb]" />
                <span className={`px-2 py-0.5 rounded ${exp.changed ? "bg-[#7c5cbf] text-white" : "bg-[#252533] text-gray-400"}`}>
                  {exp.reharm}
                </span>
              </div>

              <div className="text-[11px] text-gray-300 font-sans sm:text-right">
                {showBeginnerMode ? exp.simpleText : exp.theoryText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
