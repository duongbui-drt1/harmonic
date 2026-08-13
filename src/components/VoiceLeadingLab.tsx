import React, { useState } from "react";
import { ChordItem } from "../types";
import { compareVoiceLeading, findSmootherVoicings } from "../music/analysis/VoiceLeading";
import { Sliders, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

interface VoiceLeadingLabProps {
  chords: ChordItem[];
  onPlayPreview?: (chord: any) => void;
}

export const VoiceLeadingLab: React.FC<VoiceLeadingLabProps> = ({ chords = [], onPlayPreview }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  if (!chords || chords.length < 2) {
    return (
      <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-6 text-center text-gray-400">
        <Sliders className="w-8 h-8 text-[#7c5cbf] mx-auto mb-2 opacity-60" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Voice Leading Lab</h3>
        <p className="text-xs text-gray-400 mt-1">
          Cần ít nhất 2 hợp âm trên Timeline để tiến hành so sánh dẫn nốt Voice Leading.
        </p>
      </div>
    );
  }

  const chordA = chords[selectedIdx];
  const chordB = chords[(selectedIdx + 1) % chords.length];

  const result = compareVoiceLeading(chordA.name, chordB.name);
  const smootherOptions = findSmootherVoicings(chordA.name, chordB.name);

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2d2d3d] pb-3">
        <div>
          <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
            Voice Leading Lab (Phân Tích Dẫn Nốt Bậc Cao)
          </label>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            So Sánh Chuyển Nốt Giữa 2 Hợp Âm Liền Kề
          </h3>
        </div>

        {/* Pair selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Cặp hợp âm:</span>
          <select
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(parseInt(e.target.value, 10))}
            className="bg-[#252533] border border-[#3d3d52] text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#7c5cbf]"
          >
            {chords.map((c, idx) => {
              if (idx === chords.length - 1) return null;
              const nextC = chords[idx + 1];
              return (
                <option key={idx} value={idx}>
                  #{idx + 1} {c.name} ➔ #{idx + 2} {nextC.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Metrics breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-[#0f0f13] border border-[#2d2d3d] rounded-lg p-3 text-center">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Điểm Dẫn Nốt (Score)</label>
          <span className="text-xl font-extrabold text-emerald-400 font-mono">{result.smoothnessScore}%</span>
        </div>

        <div className="bg-[#0f0f13] border border-[#2d2d3d] rounded-lg p-3 text-center">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Nốt Chung (Common Tones)</label>
          <span className="text-sm font-bold text-indigo-300 font-mono">
            {result.commonTones.length > 0 ? result.commonTones.join(", ") : "Không có"}
          </span>
        </div>

        <div className="bg-[#0f0f13] border border-[#2d2d3d] rounded-lg p-3 text-center">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Tổng Dịch Bán Cung</label>
          <span className="text-xl font-extrabold text-amber-400 font-mono">{result.totalSemitoneMovement} semitones</span>
        </div>

        <div className="bg-[#0f0f13] border border-[#2d2d3d] rounded-lg p-3 text-center">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Trung Bình Khoảng Cách</label>
          <span className="text-xl font-extrabold text-sky-400 font-mono">{result.averageMovement} / giọng</span>
        </div>
      </div>

      {/* Note by note motion table */}
      <div>
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Chi Tiết Di Chuyển Của Từng Giọng Nốt:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {result.noteMotions.map((m, idx) => (
            <div key={idx} className="bg-[#252533] border border-[#3d3d52] rounded-lg p-2.5 text-xs flex items-center justify-between">
              <span className="font-mono text-gray-300 font-bold">{m.fromNote}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#7c5cbf]" />
              <span className="font-mono text-white font-bold">{m.toNote}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                m.semitones === 0 ? "bg-emerald-950 text-emerald-300" : m.semitones > 0 ? "bg-indigo-950 text-indigo-300" : "bg-purple-950 text-purple-300"
              }`}>
                {m.semitones === 0 ? "Nốt chung" : `${m.semitones > 0 ? "+" : ""}${m.semitones} st`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Find Smoother Voicing */}
      <div className="bg-[#0f0f13] border border-[#2d2d3d] rounded-lg p-4 space-y-3">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" /> Tự Động Tìm Thế Bấm Mượt Hơn (Smoother Voicings):
        </h4>

        <div className="space-y-2">
          {smootherOptions.map((opt, idx) => (
            <div key={idx} className="bg-[#1a1a24] border border-[#2d2d3d] rounded-lg p-3 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-white block">{opt.voicingName}</span>
                <span className="text-[11px] text-gray-400 font-mono">Nốt: [{opt.noteNames.join(", ")}]</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-mono font-bold">Score: {opt.smoothnessScore}%</span>
                <span className="text-gray-400 font-mono">Movement: {opt.totalMovement} st</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
