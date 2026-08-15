import React from "react";
import { generatePianoKeys, midiToNoteName } from "../../utils/noteNames";
import { NoteItem } from "../../types/learning";

interface PianoVisualizerProps {
  highlightedMidis?: number[];
  noteItems?: NoteItem[];
  activePlayingMidi?: number | null;
  onKeyClick?: (midi: number) => void;
  minMidi?: number;
  maxMidi?: number;
  showLabels?: boolean;
  interactive?: boolean;
}

export const PianoVisualizer: React.FC<PianoVisualizerProps> = ({
  highlightedMidis = [],
  noteItems = [],
  activePlayingMidi = null,
  onKeyClick,
  minMidi = 48, // C3
  maxMidi = 72, // C5
  showLabels = true,
  interactive = true,
}) => {
  const keys = generatePianoKeys(minMidi, maxMidi);

  // Map of midi to note item data for custom labels and colors
  const noteItemMap = React.useMemo(() => {
    const map = new Map<number, NoteItem>();
    noteItems.forEach((n) => map.set(n.midi, n));
    return map;
  }, [noteItems]);

  return (
    <div className="w-full select-none">
      <div className="relative flex justify-center w-full overflow-x-auto pb-2 pt-1">
        <div className="relative flex min-w-[580px] w-full max-w-4xl h-36 bg-[#0f0f14] p-2 rounded-xl border border-[#2d2d3d] shadow-inner">
          {keys.map((key) => {
            const isHighlighted =
              highlightedMidis.includes(key.midi) || noteItemMap.has(key.midi);
            const isActivePlaying = activePlayingMidi === key.midi;
            const noteData = noteItemMap.get(key.midi);
            const customLabel = noteData?.label;
            const customColor = noteData?.color || (isHighlighted ? "#8b5cf6" : undefined);

            if (key.isBlack) {
              const blackOffset = calcBlackKeyPositionPercent(key.midi, minMidi, maxMidi);
              return (
                <button
                  key={key.midi}
                  type="button"
                  disabled={!interactive}
                  onClick={() => onKeyClick?.(key.midi)}
                  style={{
                    left: `${blackOffset}%`,
                    backgroundColor: isActivePlaying
                      ? "#ec4899"
                      : isHighlighted
                      ? customColor || "#8b5cf6"
                      : undefined,
                  }}
                  className={`absolute z-10 w-[3.8%] h-[62%] rounded-b text-[9px] font-bold flex flex-col justify-end pb-1.5 items-center transition-all duration-150 shadow-md ${
                    isActivePlaying
                      ? "text-white ring-4 ring-pink-400 scale-105 z-20"
                      : isHighlighted
                      ? "text-white ring-2 ring-white/80 shadow-lg scale-102"
                      : "bg-[#181824] text-gray-400 hover:bg-[#252538] border-b-3 border-[#7c5cbf]"
                  } ${!interactive ? "cursor-default" : "cursor-pointer active:scale-95"}`}
                  title={`${key.fullName} (MIDI: ${key.midi})`}
                >
                  <span className="truncate max-w-full px-0.5 text-[8px] leading-tight opacity-90 font-mono">
                    {key.noteName}
                  </span>
                  {showLabels && customLabel && (
                    <span className="text-[7px] font-extrabold uppercase px-1 rounded bg-black/60 text-amber-300 truncate max-w-full">
                      {customLabel}
                    </span>
                  )}
                </button>
              );
            }

            // White key
            return (
              <button
                key={key.midi}
                type="button"
                disabled={!interactive}
                onClick={() => onKeyClick?.(key.midi)}
                style={{
                  backgroundColor: isActivePlaying
                    ? "#f472b6"
                    : isHighlighted
                    ? customColor
                      ? `${customColor}dd`
                      : "#8b5cf6"
                    : undefined,
                }}
                className={`flex-1 h-full rounded-b border border-slate-700/60 text-xs font-bold flex flex-col justify-end pb-2 items-center transition-all duration-150 ${
                  isActivePlaying
                    ? "text-white ring-4 ring-pink-400 scale-[1.02] z-20 shadow-xl"
                    : isHighlighted
                    ? "text-white ring-2 ring-purple-300 font-extrabold shadow-lg"
                    : "bg-gradient-to-b from-slate-100 to-slate-200 text-slate-900 hover:from-white hover:to-slate-100"
                } ${!interactive ? "cursor-default" : "cursor-pointer active:brightness-90"}`}
                title={`${key.fullName} (MIDI: ${key.midi})`}
              >
                <span
                  className={`text-[10px] font-mono leading-none ${
                    isHighlighted || isActivePlaying ? "text-white" : "text-slate-700"
                  }`}
                >
                  {key.fullName}
                </span>

                {showLabels && customLabel && (
                  <span
                    className={`mt-1 text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm leading-tight uppercase truncate max-w-[90%] ${
                      isActivePlaying || isHighlighted
                        ? "bg-black/70 text-amber-300"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {customLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function calcBlackKeyPositionPercent(midi: number, minMidi: number, maxMidi: number): number {
  // Count total white keys in range
  const allKeys = generatePianoKeys(minMidi, maxMidi);
  const whiteKeys = allKeys.filter((k) => !k.isBlack);
  const totalWhites = whiteKeys.length;
  if (totalWhites === 0) return 0;

  // Find index of the preceding white key
  const whiteKeyWidthPercent = 100 / totalWhites;
  let precedingWhiteCount = 0;

  for (const k of allKeys) {
    if (k.midi === midi) break;
    if (!k.isBlack) precedingWhiteCount++;
  }

  // Center black key over the border between preceding white key and next white key
  return precedingWhiteCount * whiteKeyWidthPercent - whiteKeyWidthPercent * 0.35;
}
