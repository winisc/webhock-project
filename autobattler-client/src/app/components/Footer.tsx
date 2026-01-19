import { informationsModal, type ModalType } from "../../types/infoModal";

interface FooterProps {
  onOpen: (modal: ModalType) => void;
  infoText: (info: string) => void;
}

function Footer({ onOpen, infoText }: FooterProps) {
  return (
    <footer className="absolute bottom-0 left-0 w-full px-6 py-4 flex items-center justify-between text-sm text-gray-500">
      <span>© {new Date().getFullYear()} Light and Dark Battle</span>

      <div className="flex gap-4">
        <button
          onClick={() => {
            onOpen("privacy");
            infoText(informationsModal.privacy);
          }}
          className="hover:text-[#F1F1F1] transition cursor-pointer"
        >
          Privacy
        </button>

        <button
          onClick={() => {
            onOpen("terms");
            infoText(informationsModal.terms);
          }}
          className="hover:text-[#F1F1F1] transition cursor-pointer"
        >
          Terms
        </button>

        <button
          onClick={() => {
            onOpen("help");
            infoText(informationsModal.help);
          }}
          className="hover:text-[#F1F1F1] transition cursor-pointer"
        >
          Help
        </button>
      </div>
    </footer>
  );
}

export default Footer;
