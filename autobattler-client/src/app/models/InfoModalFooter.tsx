import { useEffect } from "react";
import type { InfoModal } from "../../types/infoModal";

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
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-[90%] max-w-md bg-black px-8 py-6 border border-white max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 border-b border-white pb-2">
          <h2 className="text-white text-lg font-bold uppercase tracking-widest">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:opacity-100 opacity-60 transition text-2xl leading-none cursor-pointer pb-1"
          >
            ×
          </button>
        </div>

        <div className="text-sm text-white/80 leading-relaxed space-y-2 font-light">
          {children}
        </div>
      </div>
    </div>
  );
}

export default InfoModalFooter;
