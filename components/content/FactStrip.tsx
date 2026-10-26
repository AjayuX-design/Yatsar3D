import { Clock, MapPin, Ruler, WhatsAppIcon } from "@/components/ui/Icons";

// Four facts that are true at launch. Update this list if any stops being true.
const facts = [
  { icon: <Clock className="size-5" />, label: "Timing on every product" },
  { icon: <Ruler className="size-5" />, label: "Size on every product" },
  { icon: <MapPin className="size-5" />, label: "Delivery area stated" },
  { icon: <WhatsAppIcon className="size-5" />, label: "WhatsApp support" },
];

/** 2x2 on mobile (icon above text), four across on desktop. */
export function FactStrip() {
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line lg:grid-cols-4">
      {facts.map((f) => (
        <li key={f.label} className="flex flex-col items-start gap-2 bg-surface p-4 lg:flex-row lg:items-center lg:gap-3">
          <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-pill bg-mist text-ink">
            {f.icon}
          </span>
          <span className="t-small font-medium text-ink">{f.label}</span>
        </li>
      ))}
    </ul>
  );
}
