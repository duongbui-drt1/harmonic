import React, { useEffect, useRef } from "react";
import VexFlow from "vexflow";
import { ChordItem } from "../types";
import { midiToNoteName } from "../utils/noteNames";
import { Printer, Download, Music } from "lucide-react";

interface SheetNotationProps {
  chords: ChordItem[];
  keyName: string;
  bpm?: number;
}

export const SheetNotation: React.FC<SheetNotationProps> = ({ chords, keyName, bpm = 90 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    if (chords.length === 0) return;

    try {
      const VF = (VexFlow as any).Flow || VexFlow;
      const width = Math.max(720, chords.length * 135 + 100);
      const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
      renderer.resize(width, 210);
      const context = renderer.getContext();
      context.setFont("Arial", 10, "").setBackgroundFillStyle("#0f0f13");

      const stave = new VF.Stave(15, 30, width - 30);
      stave.addClef("treble").addTimeSignature("4/4");
      stave.setContext(context).draw();

      const staveNotes = chords.map((chord) => {
        const midis = chord.midiNotes && chord.midiNotes.length > 0 ? chord.midiNotes : [60, 64, 67];
        const vexKeys = midis.map((m) => {
          const fullName = midiToNoteName(m);
          const match = fullName.match(/^([A-G][#b]?)(-?\d+)$/i);
          if (!match) return "c/4";
          return `${match[1].toLowerCase()}/${match[2]}`;
        });

        const note = new VF.StaveNote({
          clef: "treble",
          keys: vexKeys,
          duration: "w",
        });

        // Add accidentals
        vexKeys.forEach((k, idx) => {
          if (k.includes("#")) {
            note.addModifier(new VF.Accidental("#"), idx);
          } else if (k.includes("b")) {
            note.addModifier(new VF.Accidental("b"), idx);
          }
        });

        // Add chord symbol annotation above stave
        if (chord.name) {
          const modifier = new VF.Annotation(chord.name)
            .setFont("Arial", 12, "bold")
            .setVerticalJustification(VF.Annotation.VerticalJustify.TOP);
          note.addModifier(modifier, 0);
        }

        return note;
      });

      const voice = new VF.Voice({ num_beats: chords.length * 4, beat_value: 4 });
      voice.setStrict(false);
      voice.addTickables(staveNotes);

      new VF.Formatter().joinVoices([voice]).format([voice], width - 120);
      voice.draw(context, stave);
    } catch (err) {
      console.error("VexFlow sheet music rendering error:", err);
    }
  }, [chords, keyName]);

  // Handle Printing Phổ Nhạc (Lead Sheet Printable Document)
  const handlePrintSheet = () => {
    if (chords.length === 0) return;

    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const svgContent = containerRef.current?.innerHTML || "";

    const chordRows = chords
      .map(
        (c) => `
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 12px; width: 120px; text-align: center; background: #fafafa;">
          <div style="font-size: 22px; font-weight: bold; color: #1e1b4b; font-family: monospace;">${c.name}</div>
          <div style="font-size: 13px; color: #6366f1; font-weight: 700; margin-top: 2px;">${c.romanNumeral || "—"}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 6px;">${c.beats} Ô nhịp/Beats</div>
          <div style="font-size: 10px; color: #94a3b8; font-mono: true; margin-top: 4px;">[${(c.notes || []).join(", ")}]</div>
        </div>
      `
      )
      .join("");

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Phổ Nhạc Lead Sheet - Giọng ${keyName}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; background: #fff; }
            .header { border-b: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            h1 { font-size: 28px; font-weight: 800; margin: 0; color: #1e1b4b; letter-spacing: -0.5px; }
            .meta { font-size: 14px; color: #475569; margin-top: 6px; }
            .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-left: 8px; }
            .staff-container { border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #f8fafc; overflow-x: auto; margin-bottom: 30px; display: flex; justify-content: center; }
            .grid { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 20px; }
            .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>BẢN PHỔ NHẠC HÒA ÂM (LEAD SHEET)</h1>
              <div class="meta">
                Giọng: <strong>${keyName}</strong>
                <span class="badge">${bpm} BPM</span>
                <span class="badge">4/4 Time Signature</span>
              </div>
            </div>
            <div style="font-size: 12px; color: #64748b; text-align: right;">
              Số hợp âm: <strong>${chords.length}</strong><br/>
              Xuất bởi: Harmonics Studio
            </div>
          </div>

          <h3 style="font-size: 14px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
            1. Ký Âm Dòng Nhạc (Musical Staff Notation)
          </h3>
          <div class="staff-container">
            ${svgContent}
          </div>

          <h3 style="font-size: 14px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
            2. Cấu Trúc Hợp Âm & Số La Mã (Chord Sequence & Roman Analysis)
          </h3>
          <div class="grid">
            ${chordRows}
          </div>

          <div class="footer">
            Phổ Nhạc Hoà Âm Harmonics Studio • Tùy chỉnh & Tự động Ký âm
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Export SVG file
  const handleDownloadSVG = () => {
    if (!containerRef.current) return;
    const svgElem = containerRef.current.querySelector("svg");
    if (!svgElem) return;

    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pho_nhac_${keyName.replace(/\s+/g, "_")}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (chords.length === 0) return null;

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-4">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#2d2d3d]">
        <div>
          <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
            Ký Âm Phổ Nhạc (Lead Sheet Notation)
          </label>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Hiển Thị Khuông Nhạc Ký Âm <Music className="w-4 h-4 text-[#a88beb]" />
          </h3>
          <p className="text-xs text-gray-400">
            Hiển thị hợp âm trên khuông nhạc chuẩn nhạc lý (Khóa Sol + Tên Hợp Âm).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSVG}
            className="px-3.5 py-1.5 bg-[#252533] hover:bg-[#323245] text-gray-200 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 border border-[#3d3d52] transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#a88beb]" /> Xuất SVG
          </button>

          <button
            onClick={handlePrintSheet}
            className="px-4 py-1.5 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-md transition"
          >
            <Printer className="w-3.5 h-3.5" /> In Phổ Nhạc
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div className="bg-[#0f0f13] border border-[#2d2d3d] rounded-lg p-4 overflow-x-auto flex justify-center scrollbar-thin">
        <div ref={containerRef} className="py-2" />
      </div>
    </div>
  );
};
