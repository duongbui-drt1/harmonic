import React, { useState } from "react";
import { ChordItem } from "../types";
import { generateHarmonicMutations } from "../music/harmony/HarmonicMutator";
import { exploreWhatIfTransformations } from "../music/harmony/WhatIfLab";
import { Wand2, HelpCircle, ArrowRight, Check } from "lucide-react";

interface MutatorAndWhatIfLabProps {
  chords?: ChordItem[];
  keyName?: string;
  onApplyMutation?: (newChords: any[]) => void;
}

export const MutatorAndWhatIfLab: React.FC<MutatorAndWhatIfLabProps> = ({ chords = [], keyName = "C Major", onApplyMutation }) => {
  const [selectedChordName, setSelectedChordName] = useState<string>(chords[0]?.name || "C");

  if (!chords || chords.length === 0) return null;

  const rawChords = chords.map((c) => ({ name: c.name, beats: c.beats }));
  const mutations = generateHarmonicMutations(rawChords, keyName);
  const whatIfOptions = exploreWhatIfTransformations(selectedChordName, keyName);

  return (
    <div className="space-y-6">
      {/* Module 1: Harmonic Mutator */}
      <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#2d2d3d] pb-3">
          <div>
            <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
              Harmonic Mutator Engine
            </label>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Tạo Biến Thể Hòa Âm Nâng Cấp (Harmonic Mutations) <Wand2 className="w-4 h-4 text-[#a88beb]" />
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mutations.map((m, idx) => (
            <div key={idx} className="bg-[#0f0f13] border border-[#2d2d3d] rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-wider block">{m.category}</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{m.title}</h4>

                {/* Progression view */}
                <div className="flex flex-wrap items-center gap-1.5 my-3">
                  {m.mutatedChords.map((mc, cIdx) => (
                    <React.Fragment key={cIdx}>
                      <span className="px-2.5 py-1 bg-[#252533] border border-[#3d3d52] text-indigo-300 font-mono font-bold text-xs rounded-lg">
                        {mc.name}
                      </span>
                      {cIdx < m.mutatedChords.length - 1 && <ArrowRight className="w-3 h-3 text-gray-500" />}
                    </React.Fragment>
                  ))}
                </div>

                <p className="text-xs text-gray-300">{m.theoryExplanation}</p>
                <p className="text-[11px] text-emerald-400 font-medium mt-1">{m.harmonicImpact}</p>
              </div>

              {onApplyMutation && (
                <button
                  onClick={() => onApplyMutation(m.mutatedChords)}
                  className="w-full mt-2 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase rounded-lg flex items-center justify-center gap-1.5 transition shadow-md"
                >
                  <Check className="w-3.5 h-3.5" /> Áp Dụng Biến Thể Này Vào Timeline
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Module 2: "What If?" Harmonic Laboratory */}
      <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2d2d3d] pb-3">
          <div>
            <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
              "What If?" Harmonic Laboratory
            </label>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Khám Phá Kịch Bản Thay Thế Từng Hợp Âm <HelpCircle className="w-4 h-4 text-sky-400" />
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Chọn hợp âm thử nghiệm:</span>
            <select
              value={selectedChordName}
              onChange={(e) => setSelectedChordName(e.target.value)}
              className="bg-[#252533] border border-[#3d3d52] text-white text-xs font-bold rounded-lg px-3 py-1.5"
            >
              {chords.map((c, idx) => (
                <option key={idx} value={c.name}>
                  #{idx + 1} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {whatIfOptions.map((opt, idx) => (
            <div key={idx} className="bg-[#0f0f13] border border-[#2d2d3d] rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">{opt.category}</span>
              <h4 className="text-xs font-bold text-white">{opt.title}</h4>

              <div className="flex items-center gap-2 font-mono text-xs my-2">
                <span className="text-gray-400">{opt.originalChord}</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-emerald-400 font-bold">{opt.targetChord}</span>
              </div>

              <p className="text-[11px] text-gray-300">{opt.theoreticalExplanation}</p>
              <p className="text-[10px] text-amber-300 italic">{opt.expectedEffect}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
