import React, { useEffect, useRef, useState } from "react";
import VexFlow from "vexflow";
import { ChordItem } from "../types";
import { midiToNoteName } from "../utils/noteNames";
import { Printer, Download, Music, Sun, Moon, Layers } from "lucide-react";

interface SheetNotationProps {
  chords?: ChordItem[];
  keyName?: string;
  bpm?: number;
}

export const SheetNotation: React.FC<SheetNotationProps> = ({ chords = [], keyName = "C Major", bpm = 90 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paperTheme, setPaperTheme] = useState<"white" | "dark">("white"); // Paper White default for high legibility
  const [isGrandStaff, setIsGrandStaff] = useState<boolean>(true); // Treble + Bass Clef

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    if (chords.length === 0) return;

    try {
      const VF = (VexFlow as any).Flow || VexFlow;
      const width = Math.max(760, chords.length * 150 + 120);
      const height = isGrandStaff ? 290 : 180;

      const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
      renderer.resize(width, height);
      const context = renderer.getContext();

      const isWhite = paperTheme === "white";
      const fillStyle = isWhite ? "#ffffff" : "#0f0f13";
      const strokeStyle = isWhite ? "#0f172a" : "#f8fafc";

      context.setFont("Arial", 10, "").setBackgroundFillStyle(fillStyle);
      context.setStrokeStyle(strokeStyle);
      context.setFillStyle(strokeStyle);

      // Treble Stave
      const staveTreble = new VF.Stave(15, 20, width - 30);
      staveTreble.addClef("treble").addTimeSignature("4/4");
      staveTreble.setContext(context).draw();

      // Treble Notes
      const trebleNotes = chords.map((chord) => {
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

        vexKeys.forEach((k, idx) => {
          if (k.includes("#")) {
            note.addModifier(new VF.Accidental("#"), idx);
          } else if (k.includes("b")) {
            note.addModifier(new VF.Accidental("b"), idx);
          }
        });

        if (chord.name) {
          const modifier = new VF.Annotation(chord.name)
            .setFont("Arial", 12, "bold")
            .setVerticalJustification(VF.Annotation.VerticalJustify.TOP);
          note.addModifier(modifier, 0);
        }

        return note;
      });

      const voiceTreble = new VF.Voice({ num_beats: chords.length * 4, beat_value: 4 });
      voiceTreble.setStrict(false);
      voiceTreble.addTickables(trebleNotes);

      new VF.Formatter().joinVoices([voiceTreble]).format([voiceTreble], width - 120);
      voiceTreble.draw(context, staveTreble);

      // Optional Bass Stave
      if (isGrandStaff) {
        const staveBass = new VF.Stave(15, 140, width - 30);
        staveBass.addClef("bass").addTimeSignature("4/4");
        staveBass.setContext(context).draw();

        const bassNotes = chords.map((chord) => {
          const bassMidi = chord.midiNotes && chord.midiNotes.length > 0 ? chord.midiNotes[0] - 12 : 48;
          const fullName = midiToNoteName(bassMidi);
          const match = fullName.match(/^([A-G][#b]?)(-?\d+)$/i);
          const key = match ? `${match[1].toLowerCase()}/${match[2]}` : "c/3";

          const note = new VF.StaveNote({
            clef: "bass",
            keys: [key],
            duration: "w",
          });

          if (key.includes("#")) note.addModifier(new VF.Accidental("#"), 0);
          if (key.includes("b")) note.addModifier(new VF.Accidental("b"), 0);

          return note;
        });

        const voiceBass = new VF.Voice({ num_beats: chords.length * 4, beat_value: 4 });
        voiceBass.setStrict(false);
        voiceBass.addTickables(bassNotes);

        new VF.Formatter().joinVoices([voiceBass]).format([voiceBass], width - 120);
        voiceBass.draw(context, staveBass);

        // Connect Grand Staff brace
        new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.BRACE).setContext(context).draw();
        new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(context).draw();
      }
    } catch (err) {
      console.error("VexFlow rendering error:", err);
    }
  }, [chords, keyName, paperTheme, isGrandStaff]);

  const handlePrintSheet = () => {
    if (chords.length === 0) return;
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    const svgContent = containerRef.current?.innerHTML || "";

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Phổ Nhạc Lead Sheet - ${keyName}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 30px; background: #fff; color: #0f172a; }
            h1 { font-size: 24px; font-weight: 800; color: #1e1b4b; }
            .staff { border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin: 20px 0; background: #fff; }
          </style>
        </head>
        <body>
          <h1>LEAD SHEET - GIỌNG ${keyName} (${bpm} BPM)</h1>
          <div class="staff">${svgContent}</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

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
    a.click();
  };

  if (chords.length === 0) return null;

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#2d2d3d]">
        <div>
          <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
            Ký Âm Phổ Nhạc Chuyên Nghiệp (Grand Staff Lead Sheet)
          </label>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Khuông Nhạc Nhạc Lý Standard <Music className="w-4 h-4 text-[#a88beb]" />
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Paper Theme Toggle */}
          <button
            onClick={() => setPaperTheme((prev) => (prev === "white" ? "dark" : "white"))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
              paperTheme === "white"
                ? "bg-slate-100 text-slate-900 border-slate-300"
                : "bg-[#252533] text-gray-200 border-[#3d3d52]"
            }`}
          >
            {paperTheme === "white" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            <span>Giấy {paperTheme === "white" ? "Sáng (In Nét)" : "Tối"}</span>
          </button>

          {/* Grand Staff Toggle */}
          <button
            onClick={() => setIsGrandStaff(!isGrandStaff)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
              isGrandStaff
                ? "bg-[#7c5cbf] text-white border-[#7c5cbf]"
                : "bg-[#252533] text-gray-300 border-[#3d3d52]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Khuông Đôi (Sol + Fa)</span>
          </button>

          <button
            onClick={handleDownloadSVG}
            className="px-3 py-1.5 bg-[#252533] hover:bg-[#323245] text-gray-200 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 border border-[#3d3d52] transition"
          >
            <Download className="w-3.5 h-3.5 text-[#a88beb]" /> SVG
          </button>

          <button
            onClick={handlePrintSheet}
            className="px-3.5 py-1.5 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 shadow-md transition"
          >
            <Printer className="w-3.5 h-3.5" /> In
          </button>
        </div>
      </div>

      {/* Sheet rendering area */}
      <div
        className={`rounded-lg p-4 overflow-x-auto flex justify-center border scrollbar-thin transition-colors duration-200 ${
          paperTheme === "white" ? "bg-white border-slate-300 shadow-inner" : "bg-[#0f0f13] border-[#2d2d3d]"
        }`}
      >
        <div ref={containerRef} className="py-2" />
      </div>
    </div>
  );
};
