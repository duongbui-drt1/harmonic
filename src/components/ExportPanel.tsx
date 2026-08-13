import React, { useState } from "react";
import { Midi } from "@tonejs/midi";
import { ChordItem, InstrumentType } from "../types";
import { KeyResult } from "../utils/keyDetection";
import { renderProgressionToWav } from "../utils/wavExporter";
import { Download, Printer, Copy, Check, Music, Loader2, FileText } from "lucide-react";

interface ExportPanelProps {
  chords: ChordItem[];
  detectedKey?: KeyResult;
  keyName?: string;
  bpm: number;
  timeSignature?: string;
  instrument?: InstrumentType;
  onShowToast?: (msg: string) => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  chords = [],
  detectedKey,
  keyName,
  bpm,
  instrument = "piano",
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingWav, setIsExportingWav] = useState(false);

  const activeKeyName = keyName || detectedKey?.displayName || (detectedKey?.key ? `${detectedKey.key} Major` : "C Major");
  const activeKeyRoot = detectedKey?.key || activeKeyName.split(" ")[0] || "C";

  // 1. Export WAV Audio File
  const handleExportWav = async () => {
    if (chords.length === 0 || isExportingWav) return;

    try {
      setIsExportingWav(true);
      onShowToast?.("Đang xuất âm thanh WAV chất lượng cao...");

      const inst = (instrument as InstrumentType) || "piano";
      const wavBlob = await renderProgressionToWav(chords, bpm, inst);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hoa_am_${activeKeyRoot.replace(/\s+/g, "_")}_${bpm}bpm.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onShowToast?.("Đã xuất file âm thanh WAV thành công!");
    } catch (err) {
      console.error("WAV Export Error:", err);
      onShowToast?.("Không thể xuất file WAV. Vui lòng thử lại.");
    } finally {
      setIsExportingWav(false);
    }
  };

  // 2. Export MIDI
  const handleExportMidi = () => {
    if (chords.length === 0) return;

    try {
      const midi = new Midi();
      midi.header.setTempo(bpm);
      const track = midi.addTrack();
      track.name = "Chord Progression";

      let currentTime = 0; // seconds
      const secondsPerBeat = 60 / bpm;

      chords.forEach((chord) => {
        const chordDurationSeconds = chord.beats * secondsPerBeat;
        const midis = chord.midiNotes && chord.midiNotes.length > 0 ? chord.midiNotes : [60, 64, 67];

        midis.forEach((midiNote) => {
          track.addNote({
            midi: midiNote,
            time: currentTime,
            duration: chordDurationSeconds,
            velocity: 0.8,
          });
        });

        currentTime += chordDurationSeconds;
      });

      const arrayBuffer = midi.toArray();
      const blob = new Blob([arrayBuffer], { type: "audio/midi" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hoa_am_${activeKeyRoot.replace(/\s+/g, "_")}_${bpm}bpm.mid`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onShowToast?.("Đã tải file MIDI (.mid) thành công!");
    } catch (err) {
      console.error("MIDI Export Error:", err);
      onShowToast?.("Không thể xuất file MIDI.");
    }
  };

  // 3. Copy Progression Text
  const handleCopyText = () => {
    if (chords.length === 0) return;

    const chordStr = chords.map((c) => c.name).join(" - ");
    const text = `${chordStr} (Giọng ${activeKeyName}, Tempo ${bpm} BPM)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast?.("Đã sao chép chuỗi hợp âm vào bộ nhớ tạm!");
    setTimeout(() => setCopied(false), 2000);
  };

  // 4. Print Printable Lead Sheet / Phổ Nhạc
  const handlePrintSheet = () => {
    if (chords.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const chordsHtml = chords
      .map(
        (c) => `
      <div style="border: 2px solid #cbd5e1; border-radius: 10px; padding: 14px; width: 130px; text-align: center; background: #f8fafc; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="font-size: 24px; font-weight: 800; color: #1e1b4b; font-family: monospace; margin-bottom: 4px;">${c.name}</div>
        <div style="font-size: 14px; color: #6366f1; font-weight: 700;">${c.romanNumeral || "—"}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 6px; font-weight: 600;">${c.beats} nhịp</div>
        <div style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 4px;">[${(c.notes || []).join(", ")}]</div>
      </div>
    `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bản Phổ Nhạc - Giọng ${activeKeyName}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; background: #fff; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            h1 { font-size: 28px; font-weight: 800; margin: 0; color: #1e1b4b; }
            .meta { font-size: 14px; color: #475569; margin-top: 6px; }
            .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-left: 8px; }
            .grid { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 20px; }
            .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>BẢN PHỔ NHẠC HÒA ÂM (LEAD SHEET)</h1>
              <div class="meta">
                Giọng chính: <strong>${activeKeyName}</strong>
                <span class="badge">${bpm} BPM</span>
                <span class="badge">4/4 Time Signature</span>
              </div>
            </div>
            <div style="font-size: 12px; color: #64748b; text-align: right;">
              Tổng hợp âm: <strong>${chords.length}</strong><br/>
              Phát hành bởi: Harmonics Studio
            </div>
          </div>

          <h3 style="font-size: 14px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
            Sơ Đồ Chuỗi Hợp Âm & Phân Tích
          </h3>
          <div class="grid">
            ${chordsHtml}
          </div>

          <div class="footer">
            Phổ Nhạc Hoà Âm Harmonics Studio • Tạo tự động bởi Harmonics Composer Engine
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all">
      <div>
        <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
          Xuất & Chia Sẻ (Export & Share)
        </label>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          Tùy Chọn Xuất Phổ Nhạc & Âm Thanh <FileText className="w-4 h-4 text-[#a88beb]" />
        </h3>
        <p className="text-xs text-gray-400">
          Xuất nhạc WAV, tải file MIDI cho phần mềm làm nhạc (DAW), in phổ nhạc lead sheet hoặc sao chép văn bản.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleCopyText}
          disabled={chords.length === 0}
          className="px-3.5 py-1.5 bg-[#252533] hover:bg-[#323245] text-gray-200 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 border border-[#3d3d52] disabled:opacity-40 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Đã chép!" : "Chép Văn Bản"}
        </button>

        <button
          onClick={handlePrintSheet}
          disabled={chords.length === 0}
          className="px-3.5 py-1.5 bg-[#252533] hover:bg-[#323245] text-gray-200 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 border border-[#3d3d52] disabled:opacity-40 transition"
        >
          <Printer className="w-3.5 h-3.5 text-[#a88beb]" /> Xuất Phổ Nhạc
        </button>

        <button
          onClick={handleExportWav}
          disabled={chords.length === 0 || isExportingWav}
          className="px-3.5 py-1.5 bg-[#252533] hover:bg-[#323245] text-gray-200 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 border border-[#3d3d52] disabled:opacity-40 transition"
        >
          {isExportingWav ? (
            <Loader2 className="w-3.5 h-3.5 text-[#a88beb] animate-spin" />
          ) : (
            <Music className="w-3.5 h-3.5 text-[#a88beb]" />
          )}
          {isExportingWav ? "Đang Xuất WAV..." : "Xuất File WAV"}
        </button>

        <button
          onClick={handleExportMidi}
          disabled={chords.length === 0}
          className="px-4 py-1.5 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-md disabled:opacity-40 transition"
        >
          <Download className="w-3.5 h-3.5" /> Xuất File MIDI
        </button>
      </div>
    </div>
  );
};
