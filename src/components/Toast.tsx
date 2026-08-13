import React, { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#252533] border border-[#7c5cbf] text-white text-xs font-mono font-bold px-4 py-2.5 rounded shadow-2xl flex items-center gap-3">
      <CheckCircle2 className="w-4 h-4 text-[#a88beb]" />
      <span>{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-white transition">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
