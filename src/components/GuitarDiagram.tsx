import React from "react";
import { getGuitarFingering } from "../utils/guitarVoicings";

interface GuitarDiagramProps {
  chordName: string;
}

export const GuitarDiagram: React.FC<GuitarDiagramProps> = ({ chordName }) => {
  const fingering = getGuitarFingering(chordName);

  const stringNames = ["E", "A", "D", "G", "B", "E"];
  const numFrets = 4;
  const width = 160;
  const height = 180;
  const startX = 25;
  const startY = 35;
  const stringSpacing = 22;
  const fretSpacing = 28;

  // Determine base fret offset
  let minFret = Math.min(...fingering.frets.filter((f) => f > 0));
  let maxFret = Math.max(...fingering.frets);
  let baseFret = 1;

  if (maxFret > 4) {
    baseFret = minFret;
  }

  return (
    <div className="flex flex-col items-center p-3 bg-[#0f0f13] rounded-lg border border-[#2d2d3d]">
      <div className="text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Guitar Fingering</div>

      <svg width={width} height={height} className="overflow-visible select-none">
        {/* Top Nut or Base Fret Number */}
        {baseFret === 1 ? (
          <rect
            x={startX}
            y={startY - 4}
            width={stringSpacing * 5}
            height={5}
            fill="#e5e7eb"
            rx={1}
          />
        ) : (
          <text
            x={startX - 18}
            y={startY + 15}
            fontSize="10"
            fontWeight="bold"
            fill="#a88beb"
            textAnchor="start"
          >
            {baseFret}fr
          </text>
        )}

        {/* Fret Lines */}
        {Array.from({ length: numFrets + 1 }).map((_, f) => (
          <line
            key={`fret-${f}`}
            x1={startX}
            y1={startY + f * fretSpacing}
            x2={startX + stringSpacing * 5}
            y2={startY + f * fretSpacing}
            stroke="#4b5563"
            strokeWidth={f === 0 && baseFret === 1 ? 3 : 1}
          />
        ))}

        {/* Strings */}
        {stringNames.map((sName, sIdx) => {
          const x = startX + sIdx * stringSpacing;
          const fretVal = fingering.frets[sIdx];

          return (
            <g key={`string-${sIdx}`}>
              {/* Vertical String */}
              <line
                x1={x}
                y1={startY}
                x2={x}
                y2={startY + numFrets * fretSpacing}
                stroke="#9ca3af"
                strokeWidth={1 + (5 - sIdx) * 0.3}
              />

              {/* String Name at bottom */}
              <text
                x={x}
                y={startY + numFrets * fretSpacing + 15}
                fontSize="9"
                fill="#6b7280"
                textAnchor="middle"
              >
                {sName}
              </text>

              {/* Top Symbol: 'O' or 'X' */}
              {fretVal === 0 && (
                <circle
                  cx={x}
                  cy={startY - 12}
                  r={4}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                />
              )}
              {fretVal === -1 && (
                <text
                  x={x}
                  y={startY - 8}
                  fontSize="11"
                  fontWeight="bold"
                  fill="#ef4444"
                  textAnchor="middle"
                >
                  ✕
                </text>
              )}
            </g>
          );
        })}

        {/* Barre Line if applicable */}
        {fingering.barre && (
          <rect
            x={startX + fingering.barre.startString * stringSpacing - 6}
            y={startY + (fingering.barre.fret - baseFret + 0.5) * fretSpacing - 6}
            width={(fingering.barre.endString - fingering.barre.startString) * stringSpacing + 12}
            height={12}
            rx={6}
            fill="#7c5cbf"
            opacity={0.8}
          />
        )}

        {/* Fingering Dots */}
        {fingering.frets.map((fretVal, sIdx) => {
          if (fretVal <= 0) return null;
          const displayFret = fretVal - baseFret + 1;
          if (displayFret < 1 || displayFret > numFrets) return null;

          const cx = startX + sIdx * stringSpacing;
          const cy = startY + (displayFret - 0.5) * fretSpacing;
          const fingerNum = fingering.fingers[sIdx] || "";

          return (
            <g key={`dot-${sIdx}`}>
              <circle cx={cx} cy={cy} r={7} fill="#7c5cbf" stroke="#ffffff" strokeWidth="1.5" />
              {Number(fingerNum) > 0 && (
                <text
                  x={cx}
                  y={cy + 3.5}
                  fontSize="9"
                  fontWeight="bold"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  {fingerNum}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
