import React from "react";
import { Eye, Keyboard, Ear, Volume2, Sparkles, X, CheckCircle2 } from "lucide-react";

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-modal-title"
    >
      <div className="bg-[#1a1a24] border border-[#7c5cbf] text-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Đóng cửa sổ Hỗ trợ tiếp cận"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-[#252533] hover:bg-[#323245] rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#2d2d3d]">
          <div className="p-3 bg-[#7c5cbf]/20 border border-[#7c5cbf]/40 rounded-xl text-[#a88beb]">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 rounded">
                WCAG 2.1 AA Compliant
              </span>
              <span className="text-[10px] font-bold text-[#a88beb]">Trải nghiệm Bình đẳng</span>
            </div>
            <h2 id="a11y-modal-title" className="text-lg sm:text-xl font-bold text-white mt-0.5">
              Tính Năng Hỗ Trợ Người Khuyết Tật & Phím Tắt
            </h2>
          </div>
        </div>

        {/* Grid features */}
        <div className="space-y-4 text-xs">
          {/* Section 1: Keyboard Shortcuts */}
          <div className="bg-[#0f0f13] border border-[#2d2d3d] p-4 rounded-xl space-y-3">
            <h3 className="font-bold text-[#a88beb] uppercase tracking-wider flex items-center gap-2 text-xs">
              <Keyboard className="w-4 h-4" /> 1. Điều Hướng Bàn Phím Không Cần Chuột
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
              <div className="flex items-center justify-between bg-[#1a1a24] px-3 py-2 rounded border border-[#2d2d3d]">
                <span>Phát / Tạm dừng nhạc:</span>
                <kbd className="px-2 py-1 bg-gray-800 text-white font-mono font-bold rounded border border-gray-600">Space</kbd>
              </div>
              <div className="flex items-center justify-between bg-[#1a1a24] px-3 py-2 rounded border border-[#2d2d3d]">
                <span>Hoàn tác (Undo):</span>
                <kbd className="px-2 py-1 bg-gray-800 text-white font-mono font-bold rounded border border-gray-600">Ctrl + Z</kbd>
              </div>
              <div className="flex items-center justify-between bg-[#1a1a24] px-3 py-2 rounded border border-[#2d2d3d]">
                <span>Làm lại (Redo):</span>
                <kbd className="px-2 py-1 bg-gray-800 text-white font-mono font-bold rounded border border-gray-600">Ctrl + Y</kbd>
              </div>
              <div className="flex items-center justify-between bg-[#1a1a24] px-3 py-2 rounded border border-[#2d2d3d]">
                <span>Tăng / Giảm Tempo:</span>
                <kbd className="px-2 py-1 bg-gray-800 text-white font-mono font-bold rounded border border-gray-600">↑ / ↓</kbd>
              </div>
              <div className="flex items-center justify-between bg-[#1a1a24] px-3 py-2 rounded border border-[#2d2d3d]">
                <span>Chuyển hợp âm timeline:</span>
                <kbd className="px-2 py-1 bg-gray-800 text-white font-mono font-bold rounded border border-gray-600">← / →</kbd>
              </div>
              <div className="flex items-center justify-between bg-[#1a1a24] px-3 py-2 rounded border border-[#2d2d3d]">
                <span>Bật/Tắt hướng dẫn này:</span>
                <kbd className="px-2 py-1 bg-gray-800 text-white font-mono font-bold rounded border border-gray-600">Shift + ?</kbd>
              </div>
            </div>
          </div>

          {/* Section 2: Screen Reader & Visual Assistance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#0f0f13] border border-[#2d2d3d] p-3.5 rounded-xl space-y-2">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                <Volume2 className="w-4 h-4" /> 2. Cho Trình Đọc Màn Hình
              </h4>
              <p className="text-gray-300 leading-relaxed">
                Tất cả phím đàn Piano, nhạc cụ, nút phát nhạc và thẻ hợp âm đều tích hợp chuẩn <b>ARIA Live Regions</b> & <b>aria-label</b> chi tiết để thông báo tên nốt, độ dài nhịp và hợp âm đang phát bằng giọng nói cho người khiếm thị.
              </p>
            </div>

            <div className="bg-[#0f0f13] border border-[#2d2d3d] p-3.5 rounded-xl space-y-2">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                <Ear className="w-4 h-4" /> 3. Cho Người Khiếm Thính
              </h4>
              <p className="text-gray-300 leading-relaxed">
                Phản hồi thị giác trực quan đa giác quan: Phím đàn Piano phát sáng nhấp nháy theo tần số nốt nhạc, khuông nhạc VexFlow động và thanh Dòng Thời Gian tô màu nổi bật giúp nhận biết nhịp điệu không phụ thuộc vào âm thanh.
              </p>
            </div>
          </div>

          {/* Section 3: High Contrast & AI Integration */}
          <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 p-3.5 rounded-xl flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-4 h-4 text-yellow-300" /> Tích hợp Trí Tuệ Nhân Tạo Google Gemini
              </div>
              <p className="text-gray-300 mt-1 leading-relaxed">
                Trợ lý Gemini tự động đọc cấu trúc hòa âm và giải thích bằng ngôn ngữ tự nhiên đơn giản, giúp học sinh và người khiếm thị dễ tiếp thu âm nhạc.
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs">
                <CheckCircle2 className="w-4 h-4" /> Sẵn Sàng
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[#2d2d3d] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-md"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
