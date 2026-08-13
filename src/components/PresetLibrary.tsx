import React, { useState } from "react";
import { PresetProgression, ChordItem, InstrumentType } from "../types";
import { ALL_PRESETS } from "../utils/presetData";
import { parseChordName, getChordNotes } from "../utils/chordData";
import { NOTE_NAMES_SHARP } from "../utils/noteNames";
import { Play, Search, Filter, Sparkles, Music, Guitar, Mic, Drum } from "lucide-react";

interface PresetLibraryProps {
  onLoadPreset: (chords: ChordItem[], key: string, bpm: number, instrument?: InstrumentType) => void;
  onClose?: () => void;
}

export const PresetLibrary: React.FC<PresetLibraryProps> = ({ onLoadPreset, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("Tất cả");
  const [targetKey, setTargetKey] = useState<string>("C");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const rawGenres = Array.from(new Set(ALL_PRESETS.map((p) => p.genre)));
  const genres = ["Tất cả", ...rawGenres];

  const pianoCount = ALL_PRESETS.filter((p) => p.instrument === "piano").length;
  const guitarCount = ALL_PRESETS.filter((p) => p.instrument === "acoustic_guitar" || p.instrument === "electric_guitar").length;
  const stringsCount = ALL_PRESETS.filter((p) => p.instrument === "strings").length;
  const drumsCount = ALL_PRESETS.filter((p) => p.instrument === "drums").length;

  const filteredPresets = ALL_PRESETS.filter((p) => {
    let matchesCategory = true;
    if (selectedCategory === "piano") {
      matchesCategory = p.instrument === "piano";
    } else if (selectedCategory === "guitar") {
      matchesCategory = p.instrument === "acoustic_guitar" || p.instrument === "electric_guitar";
    } else if (selectedCategory === "strings") {
      matchesCategory = p.instrument === "strings";
    } else if (selectedCategory === "drums") {
      matchesCategory = p.instrument === "drums";
    }

    const matchesGenre = selectedGenre === "Tất cả" || p.genre === selectedGenre;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.genre.toLowerCase().includes(q) ||
      p.chords.some((c) => c.name.toLowerCase().includes(q));

    return matchesCategory && matchesGenre && matchesSearch;
  });

  const handleSelectPreset = (preset: PresetProgression) => {
    // Transpose preset from its default key to targetKey if different
    const origKeyRoot = preset.key;
    let origIdx = NOTE_NAMES_SHARP.indexOf(origKeyRoot);
    if (origIdx === -1) origIdx = 0;

    let targetIdx = NOTE_NAMES_SHARP.indexOf(targetKey);
    if (targetIdx === -1) targetIdx = 0;

    const semitoneDiff = (targetIdx - origIdx + 12) % 12;

    const loadedChords: ChordItem[] = preset.chords.map((c) => {
      const parsed = parseChordName(c.name);
      let chordName = c.name;
      let root = "C";

      if (parsed) {
        let rIdx = NOTE_NAMES_SHARP.indexOf(parsed.root);
        if (rIdx === -1) rIdx = 0;
        const newRIdx = (rIdx + semitoneDiff + 12) % 12;
        root = NOTE_NAMES_SHARP[newRIdx];
        chordName = `${root}${parsed.qualityDef.aliases[0] || ""}`;
      }

      const parsedNew = parseChordName(chordName);
      const intervals = parsedNew ? parsedNew.qualityDef.intervals : [0, 4, 7];
      const { noteNames, midiNotes } = getChordNotes(root, intervals, 3);

      return {
        id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: chordName,
        root,
        quality: parsedNew ? parsedNew.qualityDef.quality : "major",
        beats: c.beats,
        notes: noteNames,
        midiNotes,
      };
    });

    onLoadPreset(loadedChords, targetKey, preset.bpm, preset.instrument);
    if (onClose) onClose();
  };

  const getInstrumentBadge = (inst?: InstrumentType) => {
    if (inst === "piano") return <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 rounded">🎹 Piano</span>;
    if (inst === "acoustic_guitar" || inst === "electric_guitar") return <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-900/60 border border-amber-500/40 text-amber-300 rounded">🎸 Guitar</span>;
    if (inst === "strings") return <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded">🎻 Strings</span>;
    if (inst === "drums") return <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-rose-900/60 border border-rose-500/40 text-rose-300 rounded">🥁 Trống</span>;
    return <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-800 border border-gray-600 text-gray-300 rounded">🎵 Tổng hợp</span>;
  };

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl transition-all">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#2d2d3d]">
        <div>
          <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-1">
            Thư Viện Hòa Âm Preset ({ALL_PRESETS.length} Vòng Mẫu Chuyên Nghiệp)
          </label>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            Thư Viện Preset Nhạc Cụ & Thể Loại <Sparkles className="w-4 h-4 text-[#a88beb]" />
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Gồm 40 Presets riêng cho Piano, 40 cho Guitar, 40 cho Dàn Dây (Strings) và 40 cho Bộ Trống (Drums).
          </p>
        </div>

        {/* Controls: Search & Key Transpose */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm preset, hợp âm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f0f13] border border-[#2d2d3d] focus:border-[#7c5cbf] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
            />
          </div>

          {/* Transpose Key Dropdown */}
          <div className="flex items-center gap-2 bg-[#0f0f13] px-3 py-1.5 rounded-lg border border-[#2d2d3d]">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đổi Giọng:</span>
            <select
              value={targetKey}
              onChange={(e) => setTargetKey(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-[#a88beb] focus:outline-none cursor-pointer"
            >
              {NOTE_NAMES_SHARP.map((k) => (
                <option key={k} value={k} className="bg-[#1a1a24] text-white">
                  Giọng {k} Major/Minor
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Instrument Category Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-[#2d2d3d]/60">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Nhạc Cụ:</span>
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${
            selectedCategory === "all"
              ? "bg-[#7c5cbf] text-white shadow-md shadow-[#7c5cbf]/20"
              : "bg-[#0f0f13] text-gray-400 hover:text-white border border-[#2d2d3d]"
          }`}
        >
          <Music className="w-3.5 h-3.5" /> Tất cả ({ALL_PRESETS.length})
        </button>

        <button
          onClick={() => setSelectedCategory("piano")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${
            selectedCategory === "piano"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "bg-[#0f0f13] text-gray-400 hover:text-white border border-[#2d2d3d]"
          }`}
        >
          🎹 Piano ({pianoCount})
        </button>

        <button
          onClick={() => setSelectedCategory("guitar")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${
            selectedCategory === "guitar"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
              : "bg-[#0f0f13] text-gray-400 hover:text-white border border-[#2d2d3d]"
          }`}
        >
          🎸 Guitar ({guitarCount})
        </button>

        <button
          onClick={() => setSelectedCategory("strings")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${
            selectedCategory === "strings"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-[#0f0f13] text-gray-400 hover:text-white border border-[#2d2d3d]"
          }`}
        >
          🎻 Chuỗi Dây / Strings ({stringsCount})
        </button>

        <button
          onClick={() => setSelectedCategory("drums")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${
            selectedCategory === "drums"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
              : "bg-[#0f0f13] text-gray-400 hover:text-white border border-[#2d2d3d]"
          }`}
        >
          🥁 Bộ Trống / Drums ({drumsCount})
        </button>
      </div>

      {/* Genre Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
        <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-1" />
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-2.5 py-1 text-xs font-bold uppercase rounded-lg tracking-wider whitespace-nowrap transition ${
              selectedGenre === g
                ? "bg-gray-200 text-gray-900 font-extrabold"
                : "bg-[#0f0f13] text-gray-400 hover:text-white border border-[#2d2d3d]"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            className="bg-[#0f0f13] border border-[#2d2d3d] hover:border-[#7c5cbf] p-4 rounded-xl flex flex-col justify-between transition-all duration-200 group hover:shadow-lg hover:shadow-[#7c5cbf]/10"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {getInstrumentBadge(preset.instrument)}
                  <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 bg-[#252533] border border-[#3d3d52] text-[#a88beb] rounded">
                    {preset.genre}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono font-bold">{preset.bpm} BPM</span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#a88beb] transition">
                {preset.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#2d2d3d] flex items-center justify-between gap-2">
              <div className="text-xs font-mono font-bold text-gray-300 truncate max-w-[170px]" title={preset.chords.map((c) => c.name).join(" - ")}>
                {preset.chords.map((c) => c.name).join(" - ")}
              </div>
              <button
                onClick={() => handleSelectPreset(preset)}
                className="px-3.5 py-1.5 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shrink-0 transition shadow-sm"
              >
                <Play className="w-3 h-3 fill-current" /> Tải & Phát
              </button>
            </div>
          </div>
        ))}

        {filteredPresets.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 text-xs">
            Không tìm thấy preset phù hợp với tìm kiếm hoặc bộ lọc hiện tại.
          </div>
        )}
      </div>
    </div>
  );
};
