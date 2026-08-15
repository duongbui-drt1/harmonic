import React, { useState, useEffect } from "react";
import { generatePianoKeys, midiToNoteName } from "../utils/noteNames";
import { detectChordFromMidiNotes } from "../utils/chordDetection";
import { parseChordName, getChordNotes } from "../utils/chordData";
import { ChordItem } from "../types";
import { Plus, Volume2, Trash2, Music, Piano } from "lucide-react";
import { MidiService } from "../services/midi/MidiService";

interface PianoKeyboardProps {
  onAddChord?: (chord: ChordItem) => void;
  onPlayNote?: (midi: number) => void;
  onNotePlay?: (midi: number) => void;
  onPlayChordPreview?: (chord: ChordItem) => void;
  onChordRecognized?: (candidate: any) => void;
  activeMidiNotes?: number[];
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  onAddChord,
  onPlayNote,
  onNotePlay,
  onPlayChordPreview,
  activeMidiNotes: propActiveMidiNotes,
}) => {
  const [selectedMidis, setSelectedMidis] = useState<number[]>([]);
  const [liveMidiNotes, setLiveMidiNotes] = useState<number[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const keys = generatePianoKeys(48, 71); // C3 (48) to B4 (71) - 2 Octaves

  // Subscribe to live MIDI notes from MidiService
  useEffect(() => {
    const unsub = MidiService.onActiveNotesChange((notes) => {
      setLiveMidiNotes([...notes]);
    });
    return () => unsub();
  }, []);

  const activeNotesCombined = Array.from(
    new Set([...selectedMidis, ...(propActiveMidiNotes || []), ...liveMidiNotes])
  );

  // Live chord detection from active or selected notes
  const notesForDetection = activeNotesCombined.length > 0 ? activeNotesCombined : selectedMidis;
  const detected = detectChordFromMidiNotes(notesForDetection);

  const toggleKey = (midi: number) => {
    if (onPlayNote) {
      onPlayNote(midi);
    } else if (onNotePlay) {
      onNotePlay(midi);
    }
    setSelectedMidis((prev) =>
      prev.includes(midi) ? prev.filter((m) => m !== midi) : [...prev, midi].sort((a, b) => a - b)
    );
  };

  const handleClear = () => {
    setSelectedMidis([]);
    setInputError(null);
  };

  const handleAddDetected = () => {
    if (!detected || notesForDetection.length === 0) return;
    const noteNames = notesForDetection.map((m) => midiToNoteName(m));
    const chordItem: ChordItem = {
      id: `chord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: detected.name,
      root: detected.root,
      quality: detected.quality || "major",
      beats: 4,
      notes: noteNames,
      midiNotes: [...notesForDetection],
    };
    onAddChord?.(chordItem);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    if (!manualInput.trim()) return;

    const parsed = parseChordName(manualInput.trim());
    if (!parsed) {
      setInputError(`Chưa nhận diện được hợp âm: "${manualInput}". Thử nhập: "Am", "Fmaj7", "G7", "Dm7b5"`);
      return;
    }

    const { noteNames, midiNotes } = getChordNotes(parsed.root, parsed.qualityDef.intervals, 3);
    const chordItem: ChordItem = {
      id: `chord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${parsed.root}${parsed.qualityDef.aliases[0] || ""}`,
      root: parsed.root,
      quality: parsed.qualityDef.quality,
      beats: 4,
      notes: noteNames,
      midiNotes: midiNotes,
    };

    onAddChord?.(chordItem);
    onPlayChordPreview?.(chordItem);
    setManualInput("");
  };

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#2d2d3d]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#a88beb] uppercase tracking-widest px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
              Bàn Phím Piano & Bộ Soạn Hợp Âm
            </span>
            {liveMidiNotes.length > 0 && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Nhận tín hiệu MIDI
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-1">
            Bàn Phím Piano Tương Tác
          </h2>
          <p className="text-xs text-gray-400">
            Bấm phím đàn, chơi phím trên MIDI controller hoặc gõ tên hợp âm để đưa vào tiến trình.
          </p>
        </div>

        {/* Live Detected Chord Badge */}
        {detected && notesForDetection.length > 0 && (
          <div className="flex items-center gap-3 bg-[#252533] px-3.5 py-2 rounded-xl border border-[#3d3d52] shadow-lg">
            <div className="text-right">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Nhận diện hợp âm
              </div>
              <div className="text-lg font-extrabold text-white font-mono">{detected.name}</div>
            </div>
            <button
              onClick={() => {
                const noteNames = notesForDetection.map((m) => midiToNoteName(m));
                onPlayChordPreview?.({
                  id: "preview",
                  name: detected.name,
                  root: detected.root,
                  quality: detected.quality,
                  beats: 4,
                  notes: noteNames,
                  midiNotes: notesForDetection,
                });
              }}
              className="p-2 bg-[#7c5cbf]/20 hover:bg-[#7c5cbf] text-[#a88beb] hover:text-white rounded-lg transition"
              title="Nghe thử âm thanh hợp âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddDetected}
              className="px-3.5 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase rounded-lg flex items-center gap-1 transition shadow-md shadow-purple-500/20"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm
            </button>
          </div>
        )}
      </div>

      {/* Piano Keyboard Component */}
      <div className="relative overflow-x-auto pb-3 pt-1 select-none">
        <div className="relative flex justify-center min-w-[640px] h-36 bg-[#0f0f13] p-2 rounded-xl border border-[#2d2d3d]">
          {keys.map((key) => {
            const isSelected = selectedMidis.includes(key.midi);
            const isLiveMidi = liveMidiNotes.includes(key.midi);
            const isHighlighted = isSelected || isLiveMidi;

            if (key.isBlack) {
              return (
                <button
                  key={key.midi}
                  onClick={() => toggleKey(key.midi)}
                  className={`absolute z-10 w-7 h-22 rounded-b text-[10px] font-bold flex flex-col justify-end pb-2 items-center transition-all shadow-md ${
                    isLiveMidi
                      ? "bg-emerald-500 text-white border-2 border-emerald-300 shadow-lg shadow-emerald-500/30 scale-105"
                      : isSelected
                      ? "bg-[#7c5cbf] text-white border-2 border-white shadow-lg scale-102"
                      : "bg-[#1a1a24] text-gray-400 hover:bg-[#252533] border-b-4 border-[#7c5cbf]"
                  }`}
                  style={{
                    left: `${calcBlackKeyPosition(key.midi)}%`,
                  }}
                  title={key.fullName}
                >
                  {key.noteName}
                </button>
              );
            }

            return (
              <button
                key={key.midi}
                onClick={() => toggleKey(key.midi)}
                className={`flex-1 h-32 rounded-b border border-gray-300 text-xs font-bold flex flex-col justify-end pb-2 items-center transition-all ${
                  isLiveMidi
                    ? "bg-emerald-400 text-black border-2 border-emerald-600 font-extrabold italic shadow-lg shadow-emerald-500/30"
                    : isSelected
                    ? "bg-[#7c5cbf] text-white border-2 border-white font-bold italic shadow-lg"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
                title={key.fullName}
              >
                <span className="text-[10px] opacity-75">{key.fullName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Bar & Manual Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#2d2d3d]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            disabled={selectedMidis.length === 0 && liveMidiNotes.length === 0}
            className="px-3.5 py-2 text-xs font-bold text-gray-300 bg-[#252533] hover:bg-[#323245] border border-[#3d3d52] rounded-xl flex items-center gap-1.5 disabled:opacity-40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa nốt đã chọn
          </button>
          <span className="text-xs text-gray-400 font-mono">
            {notesForDetection.length} nốt đang chọn
          </span>
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleManualAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => {
              setManualInput(e.target.value);
              setInputError(null);
            }}
            placeholder="Ví dụ: Am7, Fmaj7, C, G7..."
            className="px-3.5 py-2 bg-[#0f0f13] border border-[#3d3d52] rounded-xl text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#7c5cbf] w-48 sm:w-56"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1 transition shadow-md shadow-purple-500/20 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm hợp âm
          </button>
        </form>
      </div>

      {inputError && (
        <p className="text-xs text-red-300 bg-red-950/40 border border-red-800/50 p-2.5 rounded-xl">
          {inputError}
        </p>
      )}
    </div>
  );
};

// Position calculation helper for 2-octave piano keys (C3 to B4)
function calcBlackKeyPosition(midi: number): number {
  const whiteKeyOffsets: Record<number, number> = {
    49: 4.8, // C#3
    51: 11.9, // D#3
    54: 26.2, // F#3
    56: 33.3, // G#3
    58: 40.5, // A#3
    61: 54.8, // C#4
    63: 61.9, // D#4
    66: 76.2, // F#4
    68: 83.3, // G#4
    70: 90.5, // A#4
  };

  return whiteKeyOffsets[midi] || 0;
}
