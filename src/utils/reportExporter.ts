import { Progression } from "../types";

export function printHarmonicReport(progression: {
  key: string;
  bpm: number;
  timeSignature: string;
  chords: any[];
}) {
  const printWin = window.open("", "_blank");
  if (!printWin) return;

  const chordRows = progression.chords
    .map(
      (c, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Bar ${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 16px; font-weight: 800; color: #4338ca;">${c.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #6d28d9;">${c.romanNumeral || "—"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${c.beats} beats</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">[${(c.notes || []).join(", ")}]</td>
      </tr>
    `
    )
    .join("");

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Báo Cáo Phân Tích Hòa Âm Chuyên Nghiệp - HarmonicX</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; background: #fff; line-height: 1.6; }
          .header { border-bottom: 3px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          h1 { font-size: 26px; font-weight: 800; margin: 0; color: #1e1b4b; }
          .meta-box { display: flex; gap: 20px; margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
          .meta-item { flex: 1; }
          .meta-item label { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
          .meta-item span { font-size: 18px; font-weight: 800; color: #1e1b4b; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { text-align: left; padding: 10px; background: #e0e7ff; color: #3730a3; font-size: 12px; text-transform: uppercase; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>BÁO CÁO PHÂN TÍCH HÒA ÂM (HARMONIC ANALYSIS REPORT)</h1>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Tự động phân tích bởi HarmonicX Professional Engine</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>

        <div class="meta-box">
          <div class="meta-item"><label>Giọng (Key)</label><span>${progression.key}</span></div>
          <div class="meta-item"><label>Nhịp độ (BPM)</label><span>${progression.bpm}</span></div>
          <div class="meta-item"><label>Số Nhịp (Time Sig)</label><span>${progression.timeSignature}</span></div>
          <div class="meta-item"><label>Tổng số hợp âm</label><span>${progression.chords.length}</span></div>
        </div>

        <h3 style="font-size: 16px; font-weight: 800; color: #1e1b4b; margin-top: 24px;">1. BẢNG TIẾN TRÌNH HÒA ÂM & SỐ LA MÃ</h3>
        <table>
          <thead>
            <tr>
              <th>Ô Nhịp</th>
              <th>Hợp Âm</th>
              <th>Phân Tích La Mã</th>
              <th>Thời Lượng</th>
              <th>Giai Đệu / Nốt</th>
            </tr>
          </thead>
          <tbody>
            ${chordRows}
          </tbody>
        </table>

        <div class="footer">
          HarmonicX Workstation • Harmonic Reasoning & Composition Workstation
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `);
  printWin.document.close();
}
