import React from "react";
import { ChordItem } from "../types";
import { diagnoseProgression } from "../music/harmony/ChordDoctor";
import { detectModulationsInProgression } from "../music/modulation/ModulationDetector";
import { analyzeBasslineInteraction } from "../music/analysis/BasslineAnalyzer";
import { Stethoscope, Compass, Music2, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

interface DoctorAndModulationLabProps {
  chords?: ChordItem[];
  keyName?: string;
}

export const DoctorAndModulationLab: React.FC<DoctorAndModulationLabProps> = ({ chords = [], keyName = "C Major" }) => {
  if (!chords || chords.length === 0) return null;

  const rawChords = chords.map((c) => ({ name: c.name, beats: c.beats }));
  const diagnosis = diagnoseProgression(rawChords, keyName);
  const modulations = detectModulationsInProgression(rawChords, keyName);
  const bassline = analyzeBasslineInteraction(rawChords);

  return (
    <div className="space-y-6">
      {/* Module 1: Chord Doctor Diagnostics */}
      <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#2d2d3d] pb-3">
          <div>
            <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
              Chord Doctor Diagnostic Engine
            </label>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Chẩn Đoán Chất Lượng Vòng Hòa Âm <Stethoscope className="w-4 h-4 text-emerald-400" />
            </h3>
          </div>

          <div className="flex items-center gap-2 bg-[#0f0f13] border border-[#2d2d3d] px-3 py-1.5 rounded-lg">
            <span className="text-xs text-gray-400">Điểm tổng quan:</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">{diagnosis.overallScore} / 100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pros */}
          <div className="bg-[#0f0f13] border border-emerald-500/30 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Điểm Mạnh (Pros)
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-300">
              {diagnosis.pros.map((p, idx) => (
                <li key={idx}>✓ {p}</li>
              ))}
            </ul>
          </div>

          {/* Warnings */}
          <div className="bg-[#0f0f13] border border-amber-500/30 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Lưu Ý (Warnings)
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-300">
              {diagnosis.warnings.length > 0 ? (
                diagnosis.warnings.map((w, idx) => <li key={idx}>⚠ {w}</li>)
              ) : (
                <li className="text-gray-500">Không có cảnh báo.</li>
              )}
            </ul>
          </div>

          {/* Suggestions */}
          <div className="bg-[#0f0f13] border border-indigo-500/30 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-indigo-400" /> Gợi Ý Nâng Cấp (Suggestions)
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-300">
              {diagnosis.suggestions.map((s, idx) => (
                <li key={idx}>➔ {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Module 2: Modulation Detector & Bassline Analyzer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Modulation Detector */}
        <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" /> Modulation Detector (Phát Hiện Chuyển Giọng)
          </h3>

          {modulations.length > 0 ? (
            modulations.map((m, idx) => (
              <div key={idx} className="bg-[#0f0f13] border border-[#2d2d3d] rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300">Ô nhịp #{m.barNumber}: {m.fromKey} ➔ {m.toKey}</span>
                  <span className="text-emerald-400 font-mono font-bold">{m.confidence}%</span>
                </div>
                <p className="text-gray-300">{m.explanation}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 bg-[#0f0f13] border border-[#2d2d3d] p-3 rounded-lg">
              Toàn bộ tiến trình duy trì ổn định trong giọng trung tâm {keyName}.
            </p>
          )}
        </div>

        {/* Bassline Analyzer */}
        <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Music2 className="w-4 h-4 text-purple-400" /> Bassline & Chord Interaction
          </h3>

          <div className="bg-[#0f0f13] border border-[#2d2d3d] rounded-lg p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Đường nốt Trầm (Bass):</span>
              <span className="font-mono text-purple-300 font-bold">[{bassline.notes.join(" ➔ ")}]</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Độ liền mạch (Smoothness):</span>
              <span className="font-mono text-emerald-400 font-bold">{bassline.smoothnessScore}%</span>
            </div>
            {bassline.suggestions.map((s, idx) => (
              <p key={idx} className="text-gray-300 text-[11px]">➔ {s}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
