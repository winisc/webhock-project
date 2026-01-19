import { useEffect } from "react";
import type { InfoModal } from "../types/infoModal";

function InfoModalFooter({ onClose, type, children }: InfoModal) {
  const title =
    type === "terms"
      ? "Terms of Service"
      : type === "privacy"
      ? "Privacy Policy"
      : "Help";

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-[90%] max-w-md rounded-lg bg-[#1A1A1A] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#F1F1F1] text-lg font-medium">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default InfoModalFooter;
