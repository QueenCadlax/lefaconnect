import { MessageCircle } from "lucide-react";
import { CONTACT_INFO } from "./data";

const WHATSAPP_NUMBER = CONTACT_INFO.phone.replace(/\D/g, "");

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Lefa Connect on WhatsApp"
      title="Chat with Lefa Connect on WhatsApp"
      className="fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-[#25D366] text-white shadow-[0_14px_34px_-12px_rgba(11,75,40,0.65)] transition-transform duration-300 hover:-translate-y-1 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#25D366] md:right-7 md:bottom-7"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
    </a>
  );
}
