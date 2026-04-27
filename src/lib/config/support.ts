const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '351000000000';

export const WHATSAPP_SUPPORT_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function getWhatsAppUrl(message?: string): string {
  if (!message) return WHATSAPP_SUPPORT_URL;
  return `${WHATSAPP_SUPPORT_URL}?text=${encodeURIComponent(message)}`;
}
