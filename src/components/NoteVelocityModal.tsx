import React, { useState } from "react";
import { ChordItem } from "../types";
import { X, Volume2, Clock, Play, RotateCcw, Sliders, Music, Check } from "lucide-react";
import { midiToNoteName } from "../utils/noteNames";

interface NoteVelocityModalProps {
  isOpen: boolean;
  chord: ChordItem | null;
  onClose: () => void;
  onSave: (updatedChord: ChordItem) => void;
  onPlayPreview: (chord: ChordItem) => void;
  onPlayNote: (midi: number) => void;
}

export const NoteVelocityModal: React.FC<NoteVelocityModalProps> = ({
  isOpen,
  chord,
  onClose,
  onSave,
  onPlayPreview,
  onPlayNote,
}) => {
  if (!isOpen || !chord) return null;

  const [velocity, setVelocity] = useState<number>(chord.velocity ?? 80);
  const [sustain, setSustain] = useState<number>(chord.sustain ?? 100);
  const [noteVelocities, setNoteVelocities] = useState<Record<number, number>>(
    chord.noteVelocities ? { ...chord.noteVelocities } : {}
  );
  const [noteSustains, setNoteSustains] = useState<Record<number, number>>(
    chord.noteSustains ? { ...chord.noteSustains } : {}
  );

  const midiNotes = chord.midiNotes && chord.midiNotes.length > 0 ? chord.midiNotes : [60, 64, 67];

  const handleSetNoteVel = (midi: number, vel: number) => {
    setNoteVelocities((prev) => ({
      ...prev,
      [midi]: vel,
    }));
  };

  const handleSetNoteSus = (midi: number, sus: number) => {
    setNoteSustains((prev) => ({
      ...prev,
      [midi]: sus,
    }));
  };

  const handleResetAll = () => {
    setVelocity(80);
    setSustain(100);
    setNoteVelocities({});
    setNoteSustains({});
  };

  const buildUpdatedChord = (): ChordItem => ({
    ...chord,
    velocity,
    sustain,
    noteVelocities: Object.keys(noteVelocities).length > 0 ? noteVelocities : undefined,
    noteSustains: Object.keys(noteSustains).length > 0 ? noteSustains : undefined,
  });

  const handleApply = () => {
    const updated = buildUpdatedChord();
    onSave(updated);
    onClose();
  };

  const handlePreviewCurrent = () => {
    const updated = buildUpdatedChord();
    onPlayPreview(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#1a1a24] border border-[#3d3d52] rounded-2xl shadow-2xl p-5 sm:p-6 text-white max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2d2d3d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#7c5cbf]/20 border border-[#7c5cbf]/40 text-[#a88beb]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Velocity & Độ Ngân Hợp Âm <span className="font-mono text-[#a88beb]">{chord.name}</span>
              </h3>
              <p className="text-xs text-gray-400">Chỉnh độ mạnh (Velocity) và thời gian ngân dài (Sustain/Gate) của từng note</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252533] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Chord Controls */}
        <div className="space-y-4 mb-6">
          {/* Velocity Control */}
          <div className="bg-[#0f0f13] border border-[#2d2d3d] p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#a88beb]" /> Tốc Độ Gõ / Độ Mạnh (Velocity Chords)
              </label>
              <span className="font-mono font-bold text-xs text-[#a88beb] bg-[#1a1a24] px-2 py-0.5 rounded border border-[#2d2d3d]">
                {velocity}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={1}
              value={velocity}
              onChange={(e) => setVelocity(Number(e.target.value))}
              className="w-full accent-[#7c5cbf] h-2 bg-[#252533] rounded-lg cursor-pointer"
            />
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              {[
                { label: "Nhẹ (40%)", val: 40 },
                { label: "Vừa (70%)", val: 70 },
                { label: "Thường (80%)", val: 80 },
                { label: "Mạnh (100%)", val: 100 },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => setVelocity(p.val)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition ${
                    velocity === p.val
                      ? "bg-[#7c5cbf] text-white shadow-sm"
                      : "bg-[#1a1a24] text-gray-400 hover:text-white border border-[#2d2d3d]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sustain Control */}
          <div className="bg-[#0f0f13] border border-[#2d2d3d] p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#a88beb]" /> Độ Ngân / Sustain Length (Gate %)
              </label>
              <span className="font-mono font-bold text-xs text-[#a88beb] bg-[#1a1a24] px-2 py-0.5 rounded border border-[#2d2d3d]">
                {sustain}% ({(sustain / 100).toFixed(2)}x)
              </span>
            </div>
            <input
              type="range"
              min={25}
              max={200}
              step={5}
              value={sustain}
              onChange={(e) => setSustain(Number(e.target.value))}
              className="w-full accent-[#7c5cbf] h-2 bg-[#252533] rounded-lg cursor-pointer"
            />
            {/* Quick Sustain Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              {[
                { label: "Staccato (30%)", val: 30 },
                { label: "Gọn (60%)", val: 60 },
                { label: "Thường (100%)", val: 100 },
                { label: "Ngân Legato (150%)", val: 150 },
                { label: "Vang Dài (200%)", val: 200 },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => setSustain(p.val)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition ${
                    sustain === p.val
                      ? "bg-[#7c5cbf] text-white shadow-sm"
                      : "bg-[#1a1a24] text-gray-400 hover:text-white border border-[#2d2d3d]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Per-Note Customization Section */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-4 h-4 text-[#7c5cbf]" /> Chi Tiết Từng Nốt Trong Hợp Âm ({midiNotes.length} nốt)
            </label>
            <button
              onClick={handleResetAll}
              className="text-[10px] text-gray-400 hover:text-red-300 flex items-center gap-1 font-mono transition"
            >
              <RotateCcw className="w-3 h-3" /> Đặt Lại Mặc Định
            </button>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {midiNotes.map((midi, idx) => {
              const name = midiToNoteName(midi);
              const curVel = noteVelocities[midi] ?? velocity;
              const curSus = noteSustains[midi] ?? sustain;

              return (
                <div
                  key={`${midi}-${idx}`}
                  className="bg-[#0f0f13] border border-[#2d2d3d] p-3 rounded-xl flex flex-col gap-2 hover:border-[#3d3d52] transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPlayNote(midi)}
                        className="px-2 py-1 bg-[#7c5cbf]/20 hover:bg-[#7c5cbf] text-[#a88beb] hover:text-white text-xs font-mono font-bold rounded flex items-center gap-1 transition"
                        title="Nghe thử nốt đơn này"
                      >
                        <Play className="w-3 h-3 fill-current" /> {name}
                      </button>
                      <span className="text-[10px] font-mono text-gray-400">MIDI #{midi}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-[#a88beb]">Vel: {curVel}%</span>
                      <span className="text-emerald-400">Ngân: {curSus}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Note Vel Slider */}
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Velocity</div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={1}
                        value={curVel}
                        onChange={(e) => handleSetNoteVel(midi, Number(e.target.value))}
                        className="w-full accent-[#7c5cbf] h-1.5 bg-[#252533] rounded cursor-pointer"
                      />
                    </div>

                    {/* Note Sustain Slider */}
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Độ Ngân</div>
                      <input
                        type="range"
                        min={25}
                        max={200}
                        step={5}
                        value={curSus}
                        onChange={(e) => handleSetNoteSus(midi, Number(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-[#252533] rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2d2d3d]">
          <button
            onClick={handlePreviewCurrent}
            className="px-3.5 py-2 bg-[#252533] hover:bg-[#323245] text-gray-200 border border-[#3d3d52] text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#a88beb]" /> Nghe Thử
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-[#1a1a24] hover:bg-[#252533] text-gray-400 hover:text-white text-xs font-bold uppercase rounded-xl transition"
            >
              Hủy
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 shadow-md transition"
            >
              <Check className="w-4 h-4" /> Lưu Thay Đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
