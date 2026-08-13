import React from "react";
import { ChordItem } from "../types";
import { parseChordName, getChordNotes } from "../utils/chordData";
import { GuitarDiagram } from "./GuitarDiagram";
import { generatePianoKeys, midiToNoteName } from "../utils/noteNames";
import { BookOpen, Info, Volume2 } from "lucide-react";

interface ChordTheoryPanelProps {
  chord: ChordItem | null;
  onPlayPreview: (chord: ChordItem) => void;
}

export const ChordTheoryPanel: React.FC<ChordTheoryPanelProps> = ({ chord, onPlayPreview }) => {
  if (!chord) {
    return (
      <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl flex flex-col items-center justify-center text-center min-h-[300px]">
        <BookOpen className="w-8 h-8 text-gray-600 mb-2" />
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Chord Theory & Diagrams</h3>
        <p className="text-xs text-gray-400 max-w-xs mt-1">
          Select or click any chord card in your progression or keyboard to inspect formulas, notes, guitar diagrams, and piano highlights.
        </p>
      </div>
    );
  }

  const parsed = parseChordName(chord.name);
  const def = parsed?.qualityDef;
  const pianoKeys = generatePianoKeys(48, 71); // C3 to B4

  // Get active note MIDIs (modulo 12 for pitch class highlighting)
  const activePitchClasses = (chord.midiNotes || []).map((m) => (m % 12 + 12) % 12);

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2d2d3d]">
        <div>
          <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-1">
            Chord Theory & Analysis
          </label>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">{chord.name}</h3>
            {chord.romanNumeral && (
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#252533] text-[#a88beb] border border-[#3d3d52] rounded">
                {chord.romanNumeral}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 capitalize">{def?.quality || "Chord"} Theory Analysis</p>
        </div>

        <button
          onClick={() => onPlayPreview(chord)}
          className="p-2 bg-[#7c5cbf]/20 hover:bg-[#7c5cbf] text-[#a88beb] hover:text-white rounded transition"
          title="Play chord preview"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Grid: Info + Guitar + Piano */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Theory Details */}
        <div className="space-y-3">
          <div className="bg-[#0f0f13] p-3 rounded-lg border border-[#2d2d3d]">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Formula</div>
            <div className="text-sm font-mono font-bold text-[#a88beb] mt-0.5">{def?.formula || "1 - 3 - 5"}</div>
          </div>

          <div className="bg-[#0f0f13] p-3 rounded-lg border border-[#2d2d3d]">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Notes in Chord</div>
            <div className="text-sm font-mono font-bold text-white mt-0.5 tracking-wide">
              {chord.notes && chord.notes.length > 0
                ? chord.notes.join(" · ")
                : chord.root}
            </div>
          </div>

          <div className="bg-[#0f0f13] p-3 rounded-lg border border-[#2d2d3d]">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold flex items-center gap-1">
              <Info className="w-3 h-3 text-[#7c5cbf]" /> Harmonic Function / Usage
            </div>
            <div className="text-xs text-gray-300 mt-1 leading-relaxed">
              {def?.functionDescription || "Standard diatonic chord function in key."}
            </div>
          </div>
        </div>

        {/* Guitar Diagram */}
        <div>
          <GuitarDiagram chordName={chord.name} />
        </div>
      </div>

      {/* Piano Keyboard Highlight */}
      <div className="bg-[#0f0f13] p-3 rounded-lg border border-[#2d2d3d]">
        <div className="text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider text-center">Piano Key Highlight</div>
        <div className="relative flex justify-center h-20 overflow-x-auto select-none pt-1">
          {pianoKeys.map((key) => {
            const pitchClass = (key.midi % 12 + 12) % 12;
            const isHighlighted = activePitchClasses.includes(pitchClass);

            if (key.isBlack) {
              return (
                <div
                  key={key.midi}
                  className={`absolute z-10 w-4 h-12 rounded-b-sm ${
                    isHighlighted ? "bg-[#7c5cbf] shadow-md border border-white" : "bg-[#1a1a24]"
                  }`}
                  style={{ left: `${calcMiniBlackKeyPos(key.midi)}%` }}
                />
              );
            }

            return (
              <div
                key={key.midi}
                className={`flex-1 h-18 border-r border-gray-700 rounded-b-sm transition ${
                  isHighlighted ? "bg-[#7c5cbf]" : "bg-gray-100 opacity-20"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

function calcMiniBlackKeyPos(midi: number): number {
  const whiteKeyOffsets: Record<number, number> = {
    49: 4.8,
    51: 11.9,
    54: 26.2,
    56: 33.3,
    58: 40.5,
    61: 54.8,
    63: 61.9,
    66: 76.2,
    68: 83.3,
    70: 90.5,
  };
  return whiteKeyOffsets[midi] || 0;
}
