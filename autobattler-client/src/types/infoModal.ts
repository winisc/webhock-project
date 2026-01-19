import type { ReactNode } from "react";

export type ModalType = "terms" | "privacy" | "help";

export interface InfoModal {
  onClose: () => void;
  type: ModalType;
  children: ReactNode;
}

export const informationsModal = {
  privacy:
    " By using SerjãoFoguetes you agree to not abuse the service, spam rooms or attempt to break the platform.",
  terms:
    " We only store what is necessary to make rooms work. No tracking, no ads, no selling data.",
  help: "Create a room and share the link. Anyone with the link can join. If you have issues, just refresh and rejoin.",
} as const;
