import React, { useState } from "react";
import { ChordItem } from "../types";
import { calculateHarmonicTension } from "../music/harmony/TensionEngine";
import { buildHarmonicGraph } from "../music/harmony/HarmonicGraph";
import { Activity, Network, Flame } from "lucide-react";

interface TensionAndGraphLabProps {
  chords?: ChordItem[];
  keyName?: string;
}

export const TensionAndGraphLab: React.FC<TensionAndGraphLabProps> = ({ chords = [], keyName = "C Major" }) => {
  const [selectedGraphNode, setSelectedGraphNode] = useState<string | null>(null);

  if (!chords || chords.length === 0) {
    return null;
  }

  const tensionScores = chords.map((c) => calculateHarmonicTension(c.name, keyName));
  const graphData = buildHarmonicGraph(chords.map((c) => c.name), keyName);

  return (
    <div className="space-y-6">
      {/* Module 1: Harmonic Tension Meter & Timeline Curve */}
      <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#2d2d3d] pb-3">
          <div>
            <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
              Harmonic Tension Engine
            </label>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Biểu Đồ Mức Độ Căng Thẳng Hòa Âm theo Thời Gian <Activity className="w-4 h-4 text-amber-400" />
            </h3>
          </div>
        </div>

        {/* Tension Bars per Chord */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tensionScores.map((t, idx) => (
            <div key={idx} className="bg-[#0f0f13] border border-[#2d2d3d] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">{t.chordName}</span>
                <span className={`text-xs font-mono font-extrabold ${
                  t.totalScore > 75 ? "text-red-400" : t.totalScore > 45 ? "text-amber-400" : "text-emerald-400"
                }`}>
                  {t.totalScore}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#252533] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    t.totalScore > 75 ? "bg-red-500" : t.totalScore > 45 ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ width: `${t.totalScore}%` }}
                />
              </div>

              <p className="text-[10px] text-gray-400 leading-tight">{t.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Module 2: Interactive Harmonic Graph */}
      <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#2d2d3d] pb-3">
          <div>
            <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
              Harmonic Network Graph
            </label>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Mạng Lưới Tương Quan Hòa Âm & Điểm Đến Tiếp Theo <Network className="w-4 h-4 text-indigo-400" />
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-[#0f0f13] border border-[#2d2d3d] rounded-xl p-4 min-h-[220px] flex flex-wrap items-center justify-center gap-3">
            {graphData.nodes.map((node) => (
              <button
                key={node.id}
                onClick={() => setSelectedGraphNode(node.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition shadow-md border ${
                  selectedGraphNode === node.id
                    ? "bg-[#7c5cbf] text-white border-white scale-105"
                    : node.type === "current"
                    ? "bg-[#252533] text-white border-[#3d3d52]"
                    : "bg-indigo-950/60 text-indigo-200 border-indigo-500/40"
                }`}
              >
                {node.label}
                <span className="block text-[9px] text-gray-400 font-sans uppercase font-normal">{node.type}</span>
              </button>
            ))}
          </div>

          <div className="bg-[#0f0f13] border border-[#2d2d3d] rounded-xl p-4 text-xs space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Thông Tin Nút Hòa Âm</h4>
            {selectedGraphNode ? (
              (() => {
                const node = graphData.nodes.find((n) => n.id === selectedGraphNode);
                if (!node) return null;
                return (
                  <div className="space-y-2 text-gray-300">
                    <div className="text-sm font-bold text-indigo-300 font-mono">{node.label}</div>
                    <p className="text-xs text-gray-400">{node.description}</p>
                    <div className="text-[11px] text-emerald-400 font-bold">Xác suất gợi ý: {Math.round(node.probability * 100)}%</div>
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-gray-500 italic">Nhấp vào một hợp âm trên mạng lưới để xem chi tiết hướng hòa âm.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
