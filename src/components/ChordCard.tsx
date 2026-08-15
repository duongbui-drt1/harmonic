import React from "react";
import { ChordItem } from "../types";
import { X, Play, ChevronLeft, ChevronRight, Info, GripVertical, Sliders, Volume2, Clock } from "lucide-react";

interface ChordCardProps {
  chord: ChordItem;
  index: number;
  totalChords: number;
  isPlayingActive: boolean;
  isSelectedForDetails: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  availableBeats?: number[];
  onDelete: (id: string) => void;
  onUpdateBeats: (id: string, beats: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onPlayPreview: (chord: ChordItem) => void;
  onSelectForDetails: (chord: ChordItem) => void;
  onOpenVelocityModal?: (chord: ChordItem) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
}

export const ChordCard: React.FC<ChordCardProps> = ({
  chord,
  index,
  totalChords,
  isPlayingActive,
  isSelectedForDetails,
  isDragging = false,
  isDragOver = false,
  availableBeats,
  onDelete,
  onUpdateBeats,
  onMove,
  onPlayPreview,
  onSelectForDetails,
  onOpenVelocityModal,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) => {
  const velocity = chord.velocity ?? 80;
  const sustain = chord.sustain ?? 100;
  const beatOptions = availableBeats && availableBeats.length > 0 ? availableBeats : [1, 2, 4];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={(e) => onDragOver?.(e, index)}
      onDragLeave={(e) => onDragLeave?.(e)}
      onDrop={(e) => onDrop?.(e, index)}
      onDragEnd={onDragEnd}
      className={`relative group flex-shrink-0 w-36 sm:w-40 rounded-xl p-3 flex flex-col justify-between transition-all duration-200 select-none ${
        isDragging
          ? "opacity-40 scale-95 border-dashed border-[#7c5cbf] bg-[#252533]"
          : isDragOver
          ? "border-2 border-[#7c5cbf] bg-[#2d2d42] scale-105 shadow-2xl z-20"
          : isPlayingActive
          ? "bg-[#7c5cbf] border border-[#8e6fd1] shadow-xl scale-102 text-white z-10"
          : isSelectedForDetails
          ? "bg-[#252533] border border-[#7c5cbf] text-white shadow-md"
          : "bg-[#1a1a24] border border-[#2d2d3d] hover:border-[#3d3d52] text-gray-200"
      }`}
    >
      {/* Top Bar: Drag Handle, Reorder & Delete */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-0.5">
          <div
            className="p-1 cursor-grab active:cursor-grabbing text-gray-500 hover:text-white transition"
            title="Kéo thả để sắp xếp lại vị trí"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <button
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            className={`p-0.5 ${isPlayingActive ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-white"} disabled:opacity-20 transition`}
            title="Di chuyển sang trái"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMove(index, 1)}
            disabled={index === totalChords - 1}
            className={`p-0.5 ${isPlayingActive ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-white"} disabled:opacity-20 transition`}
            title="Di chuyển sang phải"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => onDelete(chord.id)}
          className={`p-1 ${isPlayingActive ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-red-400"} rounded transition`}
          title="Xóa hợp âm"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Chord Title & Roman Numeral */}
      <div className="text-center py-1.5 cursor-pointer" onClick={() => onSelectForDetails(chord)}>
        <div className="text-2xl font-bold tracking-tight">{chord.name}</div>
        <div className={`text-xs font-mono font-bold mt-0.5 ${isPlayingActive ? "text-white/90" : "text-[#a88beb]"}`}>
          {chord.romanNumeral || "—"}
        </div>
      </div>

      {/* Note list preview */}
      <div className={`text-[10px] text-center truncate px-1 py-0.5 rounded my-1 font-mono ${isPlayingActive ? "bg-[#6b4ca8] text-white" : "bg-[#0f0f13] border border-[#2d2d3d] text-gray-400"}`}>
        {chord.notes && chord.notes.length > 0
          ? chord.notes.map((n) => n.replace(/\d+$/, "")).join(" · ")
          : chord.root}
      </div>

      {/* Velocity & Sustain Badge Bar */}
      <button
        onClick={() => onOpenVelocityModal?.(chord)}
        className={`w-full my-1 py-1 px-1.5 rounded text-[10px] font-mono flex items-center justify-between transition border ${
          isPlayingActive
            ? "bg-white/20 border-white/30 text-white"
            : "bg-[#0f0f13] hover:bg-[#252533] border-[#2d2d3d] hover:border-[#7c5cbf] text-gray-300"
        }`}
        title="Chỉnh Tốc độ gõ (Velocity) & Độ ngân (Sustain) của từng note"
      >
        <span className="flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-[#a88beb]" />
          <span>{velocity}%</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>{sustain}%</span>
        </span>
      </button>

      {/* Bottom Controls: Beats & Preview */}
      <div className={`mt-1 pt-1.5 border-t flex items-center justify-between gap-1 ${isPlayingActive ? "border-white/20" : "border-[#2d2d3d]"}`}>
        {/* Beats Selector */}
        <div className={`flex items-center gap-0.5 p-0.5 rounded border ${isPlayingActive ? "bg-[#6b4ca8] border-white/20" : "bg-[#0f0f13] border-[#2d2d3d]"}`}>
          {beatOptions.map((b) => (
            <button
              key={b}
              onClick={() => onUpdateBeats(chord.id, b)}
              className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded transition ${
                chord.beats === b
                  ? isPlayingActive ? "bg-white text-[#7c5cbf]" : "bg-[#7c5cbf] text-white"
                  : isPlayingActive ? "text-white/70 hover:text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {b}b
            </button>
          ))}
        </div>

        {/* Play Preview & Theory info */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectForDetails(chord)}
            className={`p-1 ${isPlayingActive ? "text-white/80 hover:text-white" : "text-gray-400 hover:text-[#a88beb]"} rounded transition`}
            title="Xem lý thuyết & thế tay"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onPlayPreview(chord)}
            className={`p-1.5 rounded-md transition ${isPlayingActive ? "bg-white/20 hover:bg-white/30 text-white" : "bg-[#7c5cbf]/20 hover:bg-[#7c5cbf] text-[#a88beb] hover:text-white"}`}
            title="Nghe thử hợp âm"
          >
            <Play className="w-3 h-3 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};

