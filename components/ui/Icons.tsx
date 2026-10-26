// One icon library (Lucide, outline, 1.5px stroke). Re-exported here so the
// whole app imports icons from one place.
export {
  AlertTriangle,
  Box,
  Check,
  Clock,
  Info,
  Layers,
  Loader2,
  MapPin,
  Menu,
  Minus,
  Plus,
  Ruler,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";

// Lucide has no brand marks, so the WhatsApp glyph is drawn here.
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.2 15l-.3-.18-3.1.88.9-3-.2-.32A8.1 8.1 0 0 1 12.04 3.8Zm-3.2 4.1c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.15s.92 2.5 1.05 2.67c.13.17 1.8 2.86 4.45 3.9 2.2.87 2.65.7 3.13.65.48-.04 1.55-.63 1.77-1.24.22-.6.22-1.13.15-1.24-.06-.1-.24-.17-.5-.3-.27-.13-1.55-.77-1.8-.86-.24-.09-.41-.13-.59.13-.17.26-.68.86-.83 1.03-.15.17-.3.2-.57.07-.26-.13-1.1-.4-2.1-1.3-.77-.69-1.3-1.55-1.45-1.8-.15-.27-.02-.4.12-.53.12-.12.26-.3.4-.46.12-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.07-.13-.6-1.43-.82-1.96-.2-.5-.42-.43-.58-.44h-.5Z" />
    </svg>
  );
}
