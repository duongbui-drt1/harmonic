import React, { useState } from "react";
import { parseMidiArrayBuffer, MidiAnalysisResult } from "../music/midi/MidiAnalyzer";
import { Upload, FileAudio, Check, Music2 } from "lucide-react";

interface MidiAnalyzerLabProps {
  onImportMidiChords?: (chords: any[], bpm: number) => void;
}

export const MidiAnalyzerLab: React.FC<MidiAnalyzerLabProps> = ({ onImportMidiChords }) => {
  const [analysisResult, setAnalysisResult] = useState<MidiAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const res = await parseMidiArrayBuffer(buffer);
      setAnalysisResult(res);
    } catch (err) {
      console.error("MIDI parsing error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-4">
      <div className="border-b border-[#2d2d3d] pb-3">
        <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
          MIDI Harmonic Analyzer Workstation
        </label>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          Nhập Tệp MIDI & Tự Động Phân Tích Hòa Âm <FileAudio className="w-4 h-4 text-emerald-400" />
        </h3>
      </div>

      {/* Upload Dropzone */}
      <div className="border-2 border-dashed border-[#3d3d52] hover:border-[#7c5cbf] rounded-xl p-6 text-center transition cursor-pointer relative bg-[#0f0f13]">
        <input
          type="file"
          accept=".mid,.midi"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <Upload className="w-8 h-8 text-[#a88beb] mx-auto mb-2 opacity-80" />
        <p className="text-xs font-bold text-white uppercase tracking-wider">Kéo thả tệp .MID / .MIDI hoặc bấm để chọn</p>
        <p className="text-[11px] text-gray-400 mt-1">Tự động trích xuất BPM, Giọng, Hợp âm & Cấu trúc nhạc lý.</p>
      </div>

      {/* Results View */}
      {analysisResult && (
        <div className="bg-[#0f0f13] border border-[#2d2d3d] rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2d2d3d] pb-2 text-xs">
            <div>
              <span className="text-gray-400">Tempo: </span>
              <span className="font-mono text-emerald-400 font-bold">{analysisResult.bpm} BPM</span>
            </div>
            <div>
              <span className="text-gray-400">Giọng phát hiện: </span>
              <span className="font-mono text-indigo-300 font-bold">{analysisResult.detectedKey}</span>
            </div>
            <div>
              <span className="text-gray-400">Số nhịp: </span>
              <span className="font-mono text-amber-300 font-bold">{analysisResult.timeSignature}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {analysisResult.chords.map((c, idx) => (
              <div key={idx} className="bg-[#1a1a24] border border-[#2d2d3d] rounded-lg p-2.5 text-center">
                <span className="text-[10px] text-gray-400 block font-mono">Bar #{c.bar}</span>
                <span className="text-sm font-extrabold text-white font-mono">{c.chordName}</span>
                <span className="text-[10px] text-indigo-300 block font-mono mt-0.5">[{c.notes.join(", ")}]</span>
              </div>
            ))}
          </div>

          {onImportMidiChords && (
            <button
              onClick={() =>
                onImportMidiChords(
                  analysisResult.chords.map((c) => ({ name: c.chordName, beats: c.beats })),
                  analysisResult.bpm
                )
              }
              className="w-full py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase rounded-lg flex items-center justify-center gap-1.5 transition shadow-md"
            >
              <Check className="w-3.5 h-3.5" /> Đồng Bộ Hợp Âm MIDI Vào Timeline HarmonicX
            </button>
          )}
        </div>
      )}
    </div>
  );
};
