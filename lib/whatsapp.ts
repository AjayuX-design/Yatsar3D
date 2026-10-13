// Builds wa.me links. Returns null when the number is missing or invalid,
// so every WhatsApp component can hide itself instead of breaking.
export function buildWhatsAppUrl(number: string | undefined, message: string) {
  const digits = (number ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Message templates from the spec (section H). Blanks are for the buyer to fill.
export const generalEnquiryMessage =
  "Hi Yatsar 3D, I'd like a custom print. Idea: __ Size: __ Colour or material: __ Quantity: __ City: __";

export function productEnquiryMessage(p: {
  title: string;
  variant?: string;
  url: string;
}) {
  const named = p.variant ? `${p.title} (${p.variant})` : p.title;
  return `Hi Yatsar 3D, I'd like a custom version of ${named}. Link: ${p.url}. Size: __ Colour: __ Quantity: __ City: __`;
}
