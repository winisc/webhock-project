import { useState, useEffect, type ReactNode } from "react";
import type { ModalType } from "../../types/infoModal";
import Header from "./Header";
import Footer from "./Footer";
import InfoModalFooter from "../models/InfoModalFooter";

interface PageProps {
  children: ReactNode;
  title: string;
}

export default function Page({ children, title }: PageProps) {
  const [modal, setModal] = useState<ModalType | null>(null);
  const [infoText, setInfoText] = useState<string | null>(null);
  const close = () => setModal(null);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black text-white px-6 py-4 overflow-x-hidden">
      <Header />

      <main className="w-full flex-1 flex flex-col items-center justify-center z-10">
        {children}
      </main>

      <Footer onOpen={setModal} infoText={setInfoText} />

      {modal && (
        <InfoModalFooter type={modal} onClose={close}>
          {infoText}
        </InfoModalFooter>
      )}
    </div>
  );
}
