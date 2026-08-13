import React, { useState } from "react";
import { PresetProgression, ChordItem, InstrumentType } from "../types";
import { ALL_PRESETS, PIANO_PRESETS, GUITAR_PRESETS, STRINGS_PRESETS, DRUMS_PRESETS, SYNTH_PRESETS } from "../utils/presetData";
import { parseChordName, getChordNotes } from "../utils/chordData";
import { NOTE_NAMES_SHARP } from "../utils/noteNames";
import { Play, Search, Filter, Music, Guitar, Mic, Drum, Sparkles } from "lucide-react";

interface PresetLibraryProps {
  onLoadPreset?: (chords: ChordItem[], key: string, bpm: number, instrument?: InstrumentType) => void;
  onSelectPreset?: (preset: PresetProgression) => void;
  onClose?: () => void;
}

export const PresetLibrary: React.FC<PresetLibraryProps> = ({ onLoadPreset, onSelectPreset, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("Tất cả");
  const [targetKey, setTargetKey] = useState<string>("C");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const rawGenres = Array.from(new Set(ALL_PRESETS.map((p) => p.genre)));
  const genres = ["Tất cả", ...rawGenres];

  const pianoCount = PIANO_PRESETS.length;
  const guitarCount = GUITAR_PRESETS.length;
  const stringsCount = STRINGS_PRESETS.length;
  const drumsCount = DRUMS_PRESETS.length;
  const synthCount = SYNTH_PRESETS.length;

  const filteredPresets = ALL_PRESETS.filter((p) => {
    let matchesCategory = true;
    if (selectedCategory === "piano") {
      matchesCategory = p.instrument === "piano" && p.id.startsWith("piano");
    } else if (selectedCategory === "guitar") {
      matchesCategory = p.instrument === "acoustic_guitar" || p.instrument === "electric_guitar" || p.id.startsWith("guitar");
    } else if (selectedCategory === "strings") {
      matchesCategory = p.instrument === "strings" || p.id.startsWith("strings");
    } else if (selectedCategory === "drums") {
      matchesCategory = p.instrument === "drums" || p.id.startsWith("drums");
    } else if (selectedCategory === "synth") {
      matchesCategory = p.id.startsWith("synth");
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

  const handleChoosePreset = (preset: PresetProgression) => {
    if (onSelectPreset) {
      onSelectPreset(preset);
      if (onClose) onClose();
      return;
    }

    if (onLoadPreset) {
      const loadedChords: ChordItem[] = preset.chords.map((c) => {
        const parsed = parseChordName(c.name);
        const root = parsed ? parsed.root : "C";
        const intervals = parsed ? parsed.qualityDef.intervals : [0, 4, 7];
        const { noteNames, midiNotes } = getChordNotes(root, intervals, 3);
        return {
          id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: c.name,
          root,
          quality: parsed ? parsed.qualityDef.quality : "major",
          beats: c.beats,
          notes: noteNames,
          midiNotes,
        };
      });
      onLoadPreset(loadedChords, targetKey, preset.bpm, preset.instrument);
      if (onClose) onClose();
    }
  };

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-2xl p-5 shadow-2xl space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2d2d3d] pb-4">
        <div>
          <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
            Thư Viện Tiến Trình Hòa Âm (Preset Library)
          </label>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            250+ Presets Hòa Âm 5 Nhạc Cụ Chuyên Nghiệp <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedCategory === "all" ? "bg-[#7c5cbf] text-white" : "bg-[#252533] text-gray-300 hover:text-white"
            }`}
          >
            Tất cả ({ALL_PRESETS.length})
          </button>
          <button
            onClick={() => setSelectedCategory("piano")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === "piano" ? "bg-indigo-600 text-white" : "bg-[#252533] text-gray-300 hover:text-white"
            }`}
          >
            🎹 Piano ({pianoCount})
          </button>
          <button
            onClick={() => setSelectedCategory("guitar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === "guitar" ? "bg-amber-600 text-white" : "bg-[#252533] text-gray-300 hover:text-white"
            }`}
          >
            🎸 Guitar ({guitarCount})
          </button>
          <button
            onClick={() => setSelectedCategory("strings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === "strings" ? "bg-emerald-600 text-white" : "bg-[#252533] text-gray-300 hover:text-white"
            }`}
          >
            🎻 Strings ({stringsCount})
          </button>
          <button
            onClick={() => setSelectedCategory("drums")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === "drums" ? "bg-rose-600 text-white" : "bg-[#252533] text-gray-300 hover:text-white"
            }`}
          >
            🥁 Trống ({drumsCount})
          </button>
          <button
            onClick={() => setSelectedCategory("synth")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === "synth" ? "bg-purple-600 text-white" : "bg-[#252533] text-gray-300 hover:text-white"
            }`}
          >
            🎛️ Synth ({synthCount})
          </button>
        </div>
      </div>

      {/* Search & Genre Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên bài, thể loại (J-Pop, City Pop, Neo-Soul), hợp âm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f0f13] border border-[#2d2d3d] text-white text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-[#7c5cbf]"
          />
        </div>

        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-[#0f0f13] border border-[#2d2d3d] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#7c5cbf]"
        >
          {genres.map((g, idx) => (
            <option key={idx} value={g}>
              Genre: {g}
            </option>
          ))}
        </select>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredPresets.map((p) => (
          <div
            key={p.id}
            onClick={() => handleChoosePreset(p)}
            className="bg-[#0f0f13] border border-[#2d2d3d] hover:border-[#7c5cbf] rounded-xl p-4 transition cursor-pointer group space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#252533] text-[#a88beb] rounded border border-[#3d3d52]">
                  {p.genre}
                </span>
                <span className="text-[11px] font-mono text-gray-400 font-bold">{p.bpm} BPM</span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-[#a88beb] transition">{p.title}</h3>
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{p.description}</p>
            </div>

            <div className="pt-2 border-t border-[#2d2d3d]/60 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {p.chords.map((c, idx) => (
                  <span key={idx} className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#252533] text-indigo-300 rounded">
                    {c.name}
                  </span>
                ))}
              </div>

              <span className="text-xs font-bold text-[#7c5cbf] group-hover:underline flex items-center gap-1">
                Tải <Play className="w-3 h-3 fill-current" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
