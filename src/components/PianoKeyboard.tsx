import React, { useState, useEffect } from "react";
import { generatePianoKeys, midiToNoteName } from "../utils/noteNames";
import { detectChordFromMidiNotes } from "../utils/chordDetection";
import { parseChordName, getChordNotes } from "../utils/chordData";
import { ChordItem } from "../types";
import { Plus, Volume2, Trash2, Music } from "lucide-react";

interface PianoKeyboardProps {
  onAddChord?: (chord: ChordItem) => void;
  onPlayNote?: (midi: number) => void;
  onNotePlay?: (midi: number) => void;
  onPlayChordPreview?: (chord: ChordItem) => void;
  onChordRecognized?: (candidate: any) => void;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  onAddChord,
  onPlayNote,
  onNotePlay,
  onPlayChordPreview,
}) => {
  const [selectedMidis, setSelectedMidis] = useState<number[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const keys = generatePianoKeys(48, 71); // C3 (48) to B4 (71) - 2 Octaves

  // Live chord detection
  const detected = detectChordFromMidiNotes(selectedMidis);

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
    if (!detected || selectedMidis.length === 0) return;
    const noteNames = selectedMidis.map((m) => midiToNoteName(m));
    const chordItem: ChordItem = {
      id: `chord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: detected.name,
      root: detected.root,
      quality: detected.quality || "major",
      beats: 4,
      notes: noteNames,
      midiNotes: [...selectedMidis],
    };
    onAddChord?.(chordItem);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    if (!manualInput.trim()) return;

    const parsed = parseChordName(manualInput.trim());
    if (!parsed) {
      setInputError(`Unrecognized chord: "${manualInput}". Try "Am", "Fmaj7", "G7", "Dm7b5"`);
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
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#2d2d3d]">
        <div>
          <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-1">
            Virtual Piano & Chord Input
          </label>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            Interactive Piano Keyboard
          </h2>
          <p className="text-xs text-gray-400">Click keys to build or type a chord name below.</p>
        </div>

        {/* Live Detected Chord Badge */}
        {detected && selectedMidis.length > 0 && (
          <div className="flex items-center gap-3 bg-[#252533] px-3.5 py-1.5 rounded border border-[#3d3d52]">
            <div className="text-right">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Detected</div>
              <div className="text-lg font-bold text-white">{detected.name}</div>
            </div>
            <button
              onClick={() => {
                const noteNames = selectedMidis.map((m) => midiToNoteName(m));
                onPlayChordPreview?.({
                  id: "preview",
                  name: detected.name,
                  root: detected.root,
                  quality: detected.quality,
                  beats: 4,
                  notes: noteNames,
                  midiNotes: selectedMidis,
                });
              }}
              className="p-1.5 bg-[#7c5cbf]/20 hover:bg-[#7c5cbf] text-[#a88beb] hover:text-white rounded transition"
              title="Preview Chord Sound"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddDetected}
              className="px-3 py-1 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase rounded flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        )}
      </div>

      {/* Piano Keyboard Component */}
      <div className="relative overflow-x-auto pb-4 pt-2 select-none">
        <div className="relative flex justify-center min-w-[640px] h-36 bg-[#0f0f13] p-2 rounded-lg border border-[#2d2d3d]">
          {keys.map((key) => {
            const isSelected = selectedMidis.includes(key.midi);

            if (key.isBlack) {
              return (
                <button
                  key={key.midi}
                  onClick={() => toggleKey(key.midi)}
                  className={`absolute z-10 w-7 h-22 rounded-b text-[10px] font-bold flex flex-col justify-end pb-2 items-center transition-all shadow-md ${
                    isSelected
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
                  isSelected
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
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#2d2d3d]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            disabled={selectedMidis.length === 0}
            className="px-3 py-1.5 text-xs font-bold uppercase text-gray-300 bg-[#252533] hover:bg-[#323245] border border-[#3d3d52] rounded flex items-center gap-1 disabled:opacity-40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Notes
          </button>
          <span className="text-xs text-gray-400 font-mono">
            {selectedMidis.length} note{selectedMidis.length === 1 ? "" : "s"} selected
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
            placeholder="e.g. Am7, Fmaj7, C, G7..."
            className="px-3 py-1.5 bg-[#0f0f13] border border-[#3d3d52] rounded text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#7c5cbf] w-48 sm:w-56"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Chord
          </button>
        </form>
      </div>

      {inputError && (
        <p className="mt-2 text-xs text-red-300 bg-red-950/40 border border-red-800/50 p-2 rounded">
          {inputError}
        </p>
      )}
    </div>
  );
};

// Position calculation helper for 2-octave piano keys (C3 to B4)
function calcBlackKeyPosition(midi: number): number {
  // C3 (48) to B4 (71) contains 14 white keys
  // C3=48, C#3=49, D3=50, D#3=51, E3=52, F3=53, F#3=54, G3=55, G#3=56, A3=57, A#3=58, B3=59
  // C4=60, C#4=61, D4=62, D#4=63, E4=64, F4=65, F#4=66, G4=67, G#4=68, A4=69, A#4=70, B4=71
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
