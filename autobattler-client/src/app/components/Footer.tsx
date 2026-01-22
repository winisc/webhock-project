import { informationsModal, type ModalType } from "../../types/infoModal";

interface FooterProps {
  onOpen: (modal: ModalType) => void;
  infoText: (info: string) => void;
}

function Footer({ onOpen, infoText }: FooterProps) {
  return (
    <footer className="absolute bottom-0 left-0 w-full px-8 py-6 flex items-center justify-between text-xs tracking-widest text-white/40 uppercase z-20">
      <span>© {new Date().getFullYear()} L&D</span>

      <div className="flex gap-6">
        <button
          onClick={() => {
            onOpen("privacy");
            infoText(informationsModal.privacy);
          }}
          className="hover:text-white transition-colors duration-200 cursor-pointer"
        >
          Privacy
        </button>

        <button
          onClick={() => {
            onOpen("terms");
            infoText(informationsModal.terms);
          }}
          className="hover:text-white transition-colors duration-200 cursor-pointer"
        >
          Terms
        </button>

        <button
          onClick={() => {
            onOpen("help");
            infoText(informationsModal.help);
          }}
          className="hover:text-white transition-colors duration-200 cursor-pointer"
        >
          Help
        </button>
      </div>
    </footer>
  );
}

export default Footer;
