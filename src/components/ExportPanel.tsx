import React, { useState } from "react";
import { Midi } from "@tonejs/midi";
import { ChordItem, InstrumentType, TimeSignatureString, ArpeggioSettings } from "../types";
import { KeyResult } from "../utils/keyDetection";
import { renderProgressionToWav } from "../utils/wavExporter";
import { TimeSignature, RhythmRegistry } from "../music/rhythm";
import { ArpeggiatorEngine } from "../music/arpeggio";
import { Download, Printer, Copy, Check, Music, Loader2, FileText, Clock, Sparkles } from "lucide-react";

interface ExportPanelProps {
  chords: ChordItem[];
  detectedKey?: KeyResult;
  keyName?: string;
  bpm: number;
  timeSignature?: TimeSignatureString;
  timeSignatureGrouping?: number[];
  timeSignatureModel?: TimeSignature;
  instrument?: InstrumentType;
  arpeggioSettings?: ArpeggioSettings;
  onShowToast?: (msg: string) => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  chords = [],
  detectedKey,
  keyName,
  bpm,
  timeSignature = "4/4",
  timeSignatureGrouping,
  timeSignatureModel,
  instrument = "piano",
  arpeggioSettings,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingWav, setIsExportingWav] = useState(false);

  const activeKeyName = keyName || detectedKey?.displayName || (detectedKey?.key ? `${detectedKey.key} Major` : "C Major");
  const activeKeyRoot = detectedKey?.key || activeKeyName.split(" ")[0] || "C";

  const resolvedTimeSignature =
    timeSignatureModel ||
    RhythmRegistry.getTimeSignature(timeSignature, timeSignatureGrouping);

  // 1. Export WAV Audio File
  const handleExportWav = async () => {
    if (chords.length === 0 || isExportingWav) return;

    try {
      setIsExportingWav(true);
      onShowToast?.("Đang xuất âm thanh WAV chất lượng cao...");

      const inst = (instrument as InstrumentType) || "piano";
      const wavBlob = await renderProgressionToWav(
        chords,
        bpm,
        inst,
        resolvedTimeSignature,
        timeSignatureGrouping,
        arpeggioSettings
      );
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = url;
      const arpTag = arpeggioSettings?.enabled ? `_arp_${arpeggioSettings.pattern}` : "";
      a.download = `hoa_am_${activeKeyRoot.replace(/\s+/g, "_")}_${resolvedTimeSignature.name.replace("/", "-")}_${bpm}bpm${arpTag}.wav`;
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
      
      // Add exact time signature meta-event
      try {
        midi.header.timeSignatures = [
          {
            ticks: 0,
            timeSignature: [resolvedTimeSignature.numerator, resolvedTimeSignature.denominator],
            measures: 0,
          },
        ];
      } catch (e) {}

      const track = midi.addTrack();
      const isArp = arpeggioSettings?.enabled && arpeggioSettings.pattern !== "off";
      track.name = isArp
        ? `Chord Arpeggio (${arpeggioSettings.pattern} - ${resolvedTimeSignature.name})`
        : `Chord Progression (${resolvedTimeSignature.name})`;

      let currentTime = 0; // seconds

      chords.forEach((chord) => {
        const chordDurationSeconds = resolvedTimeSignature.getChordDurationInSeconds(chord.beats, bpm);

        if (isArp && arpeggioSettings) {
          const arpEvents = ArpeggiatorEngine.generateArpeggioEvents(
            chord,
            chordDurationSeconds,
            bpm,
            arpeggioSettings
          );

          arpEvents.forEach((ev) => {
            track.addNote({
              midi: ev.midi,
              time: currentTime + ev.timeOffsetSeconds,
              duration: ev.durationSeconds,
              velocity: ev.velocity,
            });
          });
        } else {
          const midis = chord.midiNotes && chord.midiNotes.length > 0 ? chord.midiNotes : [60, 64, 67];
          const baseVel = chord.velocity !== undefined ? chord.velocity / 100 : 0.8;
          const baseSustain = chord.sustain !== undefined ? chord.sustain / 100 : 1.0;

          midis.forEach((midiNote) => {
            const noteVel = chord.noteVelocities?.[midiNote] !== undefined ? chord.noteVelocities[midiNote] / 100 : baseVel;
            const noteSus = chord.noteSustains?.[midiNote] !== undefined ? chord.noteSustains[midiNote] / 100 : baseSustain;

            track.addNote({
              midi: midiNote,
              time: currentTime,
              duration: chordDurationSeconds * noteSus,
              velocity: noteVel,
            });
          });
        }

        currentTime += chordDurationSeconds;
      });

      const arrayBuffer = midi.toArray();
      const blob = new Blob([arrayBuffer], { type: "audio/midi" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const arpTag = isArp ? `_arp_${arpeggioSettings?.pattern}` : "";
      a.download = `hoa_am_${activeKeyRoot.replace(/\s+/g, "_")}_${resolvedTimeSignature.name.replace("/", "-")}_${bpm}bpm${arpTag}.mid`;
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
    const text = `${chordStr} (Giọng ${activeKeyName}, Nhịp ${resolvedTimeSignature.formatMeter()}, Tempo ${bpm} BPM)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast?.("Đã sao chép chuỗi hợp âm vào bộ nhớ tạm!");
    setTimeout(() => setCopied(false), 2000);
  };

  // 4. Print Printable Lead Sheet / Phổ Nhạc
  const handlePrintLeadSheet = () => {
    window.print();
  };

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2d2d3d]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#7c5cbf]/20 text-[#a88beb]">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Xuất File & Chia Sẻ (Export)</h3>
            <p className="text-[11px] text-gray-400">
              Xuất MIDI cho DAW (FL Studio, Logic, Ableton), file âm thanh WAV hoặc in bản phổ nhạc
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
          <Clock className="w-3.5 h-3.5 text-[#a88beb]" />
          <span>{resolvedTimeSignature.formatMeter()} · {bpm} BPM</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* MIDI Export */}
        <button
          onClick={handleExportMidi}
          disabled={chords.length === 0}
          className="p-3 bg-[#0f0f13] hover:bg-[#252533] border border-[#2d2d3d] hover:border-[#7c5cbf] rounded-xl flex flex-col items-center justify-center gap-2 text-center group disabled:opacity-40 transition"
          title="Tải file MIDI đa bè hỗ trợ mọi DAW"
        >
          <div className="w-8 h-8 rounded-lg bg-[#7c5cbf]/10 group-hover:bg-[#7c5cbf]/20 text-[#a88beb] flex items-center justify-center transition">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-[#a88beb] transition">
              Xuất MIDI (.mid)
            </div>
            <div className="text-[10px] text-gray-400">Tempo & TimeSig chuẩn</div>
          </div>
        </button>

        {/* WAV Export */}
        <button
          onClick={handleExportWav}
          disabled={chords.length === 0 || isExportingWav}
          className="p-3 bg-[#0f0f13] hover:bg-[#252533] border border-[#2d2d3d] hover:border-[#7c5cbf] rounded-xl flex flex-col items-center justify-center gap-2 text-center group disabled:opacity-40 transition"
          title="Thu âm offline chất lượng phòng thu thành file WAV"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition">
            {isExportingWav ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
              {isExportingWav ? "Đang xuất..." : "Xuất Audio WAV"}
            </div>
            <div className="text-[10px] text-gray-400">16-bit 44.1kHz PCM</div>
          </div>
        </button>

        {/* Copy Text */}
        <button
          onClick={handleCopyText}
          disabled={chords.length === 0}
          className="p-3 bg-[#0f0f13] hover:bg-[#252533] border border-[#2d2d3d] hover:border-[#7c5cbf] rounded-xl flex flex-col items-center justify-center gap-2 text-center group disabled:opacity-40 transition"
          title="Sao chép tên hợp âm để dán vào tài liệu"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-400 flex items-center justify-center transition">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition">
              {copied ? "Đã sao chép!" : "Sao chép Text"}
            </div>
            <div className="text-[10px] text-gray-400">Chuỗi ký hiệu hợp âm</div>
          </div>
        </button>

        {/* Print Lead Sheet */}
        <button
          onClick={handlePrintLeadSheet}
          disabled={chords.length === 0}
          className="p-3 bg-[#0f0f13] hover:bg-[#252533] border border-[#2d2d3d] hover:border-[#7c5cbf] rounded-xl flex flex-col items-center justify-center gap-2 text-center group disabled:opacity-40 transition"
          title="In hoặc lưu PDF bản phổ nhạc (Lead Sheet)"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-amber-400 transition">
              In Lead Sheet (PDF)
            </div>
            <div className="text-[10px] text-gray-400">Bản phổ nhạc chuẩn</div>
          </div>
        </button>
      </div>
    </div>
  );
};
