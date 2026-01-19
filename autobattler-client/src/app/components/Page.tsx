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
    <div className="relative h-dvh w-screen flex flex-col items-center justify-center bg-[#0F0F0F] px-6 py-4">
      <Header />

      {children}

      <Footer onOpen={setModal} infoText={setInfoText} />

      {modal && (
        <InfoModalFooter type={modal} onClose={close}>
          {infoText}
        </InfoModalFooter>
      )}
    </div>
  );
}
