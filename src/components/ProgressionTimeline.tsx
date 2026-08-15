import React, { useState, useRef, useEffect } from "react";
import { ChordItem, TimeSignatureString } from "../types";
import { ChordCard } from "./ChordCard";
import { KeyResult } from "../utils/keyDetection";
import { Trash2, ArrowUp, ArrowDown, Music, Copy, Sparkles, Undo2, Redo2, Shuffle, Sliders, ChevronDown, Check } from "lucide-react";
import { parseChordName, getChordNotes } from "../utils/chordData";
import { NOTE_NAMES_SHARP } from "../utils/noteNames";
import { transposeProgression } from "../utils/chordTransposer";
import { TimeSignature, RhythmRegistry } from "../music/rhythm";

const ROOT_NOTES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

interface ProgressionTimelineProps {
  chords: ChordItem[];
  detectedKey: KeyResult;
  timeSignature?: TimeSignatureString;
  timeSignatureGrouping?: number[];
  timeSignatureModel?: TimeSignature;
  bpm?: number;
  customKey?: { root: string; mode: "major" | "minor" } | null;
  onSetCustomKey?: (key: { root: string; mode: "major" | "minor" } | null) => void;
  playingIndex: number | null;
  selectedChordForDetails: ChordItem | null;
  onDeleteChord: (id: string) => void;
  onUpdateBeats: (id: string, beats: number) => void;
  onMoveChord: (index: number, direction: -1 | 1) => void;
  onPlayPreview: (chord: ChordItem) => void;
  onSelectChordForDetails: (chord: ChordItem) => void;
  onOpenVelocityModal?: (chord: ChordItem) => void;
  onClearTimeline: () => void;
  onSetChords: (chords: ChordItem[]) => void;
  onOpenPresetLibrary: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  pastCount?: number;
  futureCount?: number;
}

export const ProgressionTimeline: React.FC<ProgressionTimelineProps> = ({
  chords = [],
  detectedKey,
  timeSignature = "4/4",
  timeSignatureGrouping,
  timeSignatureModel,
  bpm = 120,
  customKey = null,
  onSetCustomKey,
  playingIndex,
  selectedChordForDetails,
  onDeleteChord,
  onUpdateBeats,
  onMoveChord,
  onPlayPreview,
  onSelectChordForDetails,
  onOpenVelocityModal,
  onClearTimeline,
  onSetChords,
  onOpenPresetLibrary,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  pastCount = 0,
  futureCount = 0,
}) => {
  const model =
    timeSignatureModel ||
    RhythmRegistry.getTimeSignature(timeSignature, timeSignatureGrouping);

  // Dynamic beat options for chords matching the meter
  const availableBeats = React.useMemo(() => {
    const num = model.numerator;
    const den = model.denominator;

    if (num === 4 && den === 4) return [1, 2, 4];
    if (num === 3 && den === 4) return [1, 2, 3];
    if (num === 2 && den === 4) return [1, 2];
    if (num === 6 && den === 8) return [1, 2, 6];
    if (num === 3 && den === 8) return [1, 2, 3];
    if (num === 9 && den === 8) return [1, 2, 3];
    if (num === 12 && den === 8) return [1, 2, 4];
    if (num === 2 && den === 2) return [1, 2];
    if (num === 5 && den === 4) return [1, 2, 3, 5];
    if (num === 7 && den === 8) return [2, 3, 7];
    return [1, 2, Math.max(2, num)];
  }, [model]);
  const [isKeyPickerOpen, setIsKeyPickerOpen] = useState(false);
  const keyPickerRef = useRef<HTMLDivElement>(null);

  // Drag and Drop State for Chord Reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // leave container
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...chords];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    onSetChords(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Close key picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (keyPickerRef.current && !keyPickerRef.current.contains(e.target as Node)) {
        setIsKeyPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Transpose function for entire progression
  const handleTranspose = (semitones: number) => {
    if (chords.length === 0) return;
    const transposed = transposeProgression(chords, semitones);
    onSetChords(transposed);
  };

  // Shuffle existing chords in the progression
  const handleShuffle = () => {
    if (!chords || chords.length <= 1) return;

    const shuffled = [...chords];
    // Fisher-Yates algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Guarantee order changes if length > 1
    if (JSON.stringify(shuffled.map((c) => c.id)) === JSON.stringify(chords.map((c) => c.id))) {
      shuffled.reverse();
    }

    onSetChords(shuffled);
  };

  const totalBeats = (chords || []).reduce((sum, c) => sum + (c?.beats || 0), 0);
  const safeKey = detectedKey || { key: "C", root: "C", mode: "major", displayName: "C Major" };

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#2d2d3d]">
        <div>
          <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-1">
            Progression Timeline
          </label>
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold text-white">Chords Sequence</h2>
            <div className="relative" ref={keyPickerRef}>
              <button
                onClick={() => setIsKeyPickerOpen(!isKeyPickerOpen)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded border transition flex items-center gap-1.5 ${
                  customKey
                    ? "bg-[#7c5cbf]/25 border-[#7c5cbf] text-[#a88beb] hover:bg-[#7c5cbf]/40"
                    : "bg-[#252533] border-[#3d3d52] text-gray-300 hover:text-white"
                }`}
                title="Click to customize main key signature"
              >
                <Sliders className="w-3 h-3 text-[#a88beb]" />
                <span>Key: {safeKey.displayName}</span>
                {customKey ? (
                  <span className="text-[9px] bg-[#7c5cbf] text-white px-1 py-0.2 rounded font-sans uppercase">
                    Custom
                  </span>
                ) : (
                  <span className="text-[9px] bg-[#1a1a24] text-gray-400 px-1 py-0.2 rounded font-sans uppercase border border-[#3d3d52]">
                    Tự động
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* Key Picker Popover */}
              {isKeyPickerOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a24] border border-[#3d3d52] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#2d2d3d]">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#7c5cbf]" /> Giọng Điệu Chính (Key)
                    </span>
                    <button
                      onClick={() => {
                        onSetCustomKey?.(null);
                        setIsKeyPickerOpen(false);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition ${
                        !customKey
                          ? "bg-[#7c5cbf] text-white"
                          : "bg-[#252533] text-gray-300 hover:text-white border border-[#3d3d52]"
                      }`}
                    >
                      Tự Động Phát Hiện
                    </button>
                  </div>

                  {/* Root Selection */}
                  <div className="mb-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Nốt Chủ (Root Note)
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {ROOT_NOTES.map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            onSetCustomKey?.({
                              root: r,
                              mode: safeKey.mode,
                            });
                          }}
                          className={`py-1 text-xs font-mono font-bold rounded transition ${
                            safeKey.root === r
                              ? "bg-[#7c5cbf] text-white shadow-sm"
                              : "bg-[#252533] text-gray-300 hover:bg-[#323245]"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode Selection */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Điệu Tính (Mode)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["major", "minor"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            onSetCustomKey?.({
                              root: safeKey.root,
                              mode: m,
                            });
                          }}
                          className={`py-1 text-xs font-mono font-bold uppercase rounded transition ${
                            safeKey.mode === m
                              ? "bg-[#7c5cbf] text-white shadow-sm"
                              : "bg-[#252533] text-gray-300 hover:bg-[#323245]"
                          }`}
                        >
                          {m === "major" ? "Trưởng (Major)" : "Thứ (Minor)"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 font-mono">
              ({chords.length}/16 hợp âm · {totalBeats} phách)
            </span>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Undo / Redo Buttons */}
          <div className="flex items-center bg-[#252533] border border-[#3d3d52] rounded p-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="px-2.5 py-1.5 hover:bg-[#323245] text-gray-300 disabled:text-gray-600 text-xs font-bold uppercase rounded flex items-center gap-1 transition disabled:cursor-not-allowed"
              title="Hoàn tác thay đổi vừa thực hiện (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
              {pastCount > 0 && (
                <span className="text-[10px] font-mono px-1 bg-[#1a1a24] text-[#a88beb] rounded border border-[#3d3d52]">
                  {pastCount}
                </span>
              )}
            </button>
            <div className="w-[1px] h-4 bg-[#3d3d52]" />
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="px-2.5 py-1.5 hover:bg-[#323245] text-gray-300 disabled:text-gray-600 text-xs font-bold uppercase rounded flex items-center gap-1 transition disabled:cursor-not-allowed"
              title="Làm lại thay đổi (Ctrl+Y / Cmd+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span>Redo</span>
              {futureCount > 0 && (
                <span className="text-[10px] font-mono px-1 bg-[#1a1a24] text-[#a88beb] rounded border border-[#3d3d52]">
                  {futureCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleShuffle}
            disabled={chords.length <= 1}
            className="px-2.5 py-1.5 bg-[#252533] hover:bg-[#323245] text-gray-300 border border-[#3d3d52] text-xs font-bold uppercase rounded flex items-center gap-1.5 disabled:opacity-40 transition"
            title="Trộn ngẫu nhiên thứ tự các hợp âm"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#a88beb]" /> Trộn
          </button>
          <button
            onClick={() => handleTranspose(-1)}
            disabled={chords.length === 0}
            className="px-2.5 py-1.5 bg-[#252533] hover:bg-[#323245] text-gray-300 border border-[#3d3d52] text-xs font-bold uppercase rounded flex items-center gap-1 disabled:opacity-40 transition"
            title="Dịch giọng xuống 1 nửa cung (-1 semitone)"
          >
            <ArrowDown className="w-3.5 h-3.5" /> -1 Nửa Cung
          </button>
          <button
            onClick={() => handleTranspose(1)}
            disabled={chords.length === 0}
            className="px-2.5 py-1.5 bg-[#252533] hover:bg-[#323245] text-gray-300 border border-[#3d3d52] text-xs font-bold uppercase rounded flex items-center gap-1 disabled:opacity-40 transition"
            title="Dịch giọng lên 1 nửa cung (+1 semitone)"
          >
            <ArrowUp className="w-3.5 h-3.5" /> +1 Nửa Cung
          </button>
          <button
            onClick={onClearTimeline}
            disabled={chords.length === 0}
            className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold uppercase rounded flex items-center gap-1 border border-red-800/40 disabled:opacity-40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa Hết
          </button>
        </div>
      </div>

      {/* Horizontal Timeline List */}
      {chords.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-[#0f0f13] border border-dashed border-[#2d2d3d] rounded-xl">
          <div className="w-12 h-12 rounded-full bg-[#252533] border border-[#3d3d52] flex items-center justify-center text-[#7c5cbf] mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Dòng thời gian hợp âm đang trống</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-4">
            Bấm phím trên đàn Piano, chơi phím MIDI Controller, chọn mẫu tiến trình có sẵn hoặc nhờ AI gợi ý hòa âm.
          </p>
          <button
            onClick={onOpenPresetLibrary}
            className="px-4 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition"
          >
            Mở Thư Viện Hợp Âm Có Sẵn
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin">
          {chords.map((chord, idx) => (
            <ChordCard
              key={chord.id}
              chord={chord}
              index={idx}
              totalChords={chords.length}
              isPlayingActive={playingIndex === idx}
              isSelectedForDetails={selectedChordForDetails?.id === chord.id}
              isDragging={draggedIndex === idx}
              isDragOver={dragOverIndex === idx}
              availableBeats={availableBeats}
              onDelete={onDeleteChord}
              onUpdateBeats={onUpdateBeats}
              onMove={onMoveChord}
              onPlayPreview={onPlayPreview}
              onSelectForDetails={onSelectChordForDetails}
              onOpenVelocityModal={onOpenVelocityModal}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
};
