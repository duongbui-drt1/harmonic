import React, { useState } from "react";
import { ChordItem } from "../types";
import { GENRE_PROFILES, transformMakeItMore } from "../music/genre/GenreDNA";
import { Sparkles, Layers, ArrowRight, Check } from "lucide-react";

interface GenreAndStyleLabProps {
  chords?: ChordItem[];
  keyName?: string;
  onApplyMakeItMore?: (newChords: any[]) => void;
}

export const GenreAndStyleLab: React.FC<GenreAndStyleLabProps> = ({ chords = [], keyName = "C Major", onApplyMakeItMore }) => {
  const [selectedGenreId, setSelectedGenreId] = useState<string>("jpop");
  const [activeMoodOption, setActiveMoodOption] = useState<string>("Emotional");

  if (!chords || chords.length === 0) return null;

  const activeGenre = GENRE_PROFILES.find((g) => g.id === selectedGenreId) || GENRE_PROFILES[0];

  const moodButtons = [
    "Emotional",
    "Nostalgic",
    "Dark",
    "Jazzy",
    "J-Pop",
    "Romantic",
  ];

  const transformedChords = transformMakeItMore(
    chords.map((c) => ({ name: c.name, beats: c.beats })),
    activeMoodOption,
    keyName
  );

  return (
    <div className="space-y-6">
      {/* Module 1: Genre Harmony DNA */}
      <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2d2d3d] pb-3">
          <div>
            <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
              Genre Harmony DNA Engine
            </label>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Hồ Sơ Hòa Âm Theo Dòng Nhạc (Genre DNA Profiles) <Layers className="w-4 h-4 text-indigo-400" />
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Chọn Dòng Nhạc:</span>
            <select
              value={selectedGenreId}
              onChange={(e) => setSelectedGenreId(e.target.value)}
              className="bg-[#252533] border border-[#3d3d52] text-white text-xs font-bold rounded-lg px-3 py-1.5"
            >
              {GENRE_PROFILES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-[#0f0f13] border border-[#2d2d3d] rounded-xl p-4 space-y-3">
          <p className="text-xs text-gray-300">{activeGenre.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Loại hợp âm ưa chuộng:</span>
              <span className="font-mono text-indigo-300 font-bold">{activeGenre.preferredChordTypes.join(", ")}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Dải BPM phổ biến:</span>
              <span className="font-mono text-emerald-400 font-bold">{activeGenre.typicalBpmRange[0]} - {activeGenre.typicalBpmRange[1]} BPM</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Cadence đặc trưng:</span>
              <span className="font-mono text-amber-300 font-bold">{activeGenre.characteristicCadences.join(" | ")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module 2: "Make It More..." Generator */}
      <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-4">
        <div className="border-b border-[#2d2d3d] pb-3">
          <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
            "Make It More..." Harmonic Transformer
          </label>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Điều Chỉnh Cảm Xúc Hợp Âm Tức Thời <Sparkles className="w-4 h-4 text-yellow-400" />
          </h3>
        </div>

        {/* Mood Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {moodButtons.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMoodOption(m)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                activeMoodOption === m
                  ? "bg-[#7c5cbf] text-white border-[#7c5cbf] shadow-md shadow-[#7c5cbf]/20"
                  : "bg-[#252533] text-gray-300 border-[#3d3d52] hover:text-white"
              }`}
            >
              Make It More {m}...
            </button>
          ))}
        </div>

        {/* Transformed Result View */}
        <div className="bg-[#0f0f13] border border-[#2d2d3d] rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">Kết quả chuyển đổi ({activeMoodOption}):</span>
            {transformedChords.map((tc, idx) => (
              <React.Fragment key={idx}>
                <span className="px-3 py-1 bg-[#252533] border border-[#3d3d52] text-emerald-300 font-mono font-bold text-xs rounded-lg">
                  {tc.name}
                </span>
                {idx < transformedChords.length - 1 && <ArrowRight className="w-3 h-3 text-gray-500" />}
              </React.Fragment>
            ))}
          </div>

          {onApplyMakeItMore && (
            <button
              onClick={() => onApplyMakeItMore(transformedChords)}
              className="mt-3 px-4 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition shadow-md"
            >
              <Check className="w-3.5 h-3.5" /> Áp Dụng Vòng "{activeMoodOption}" Vào Timeline
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
