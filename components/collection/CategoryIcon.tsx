import { Archive, Box, Gift, House, LampDesk, LayoutGrid, Wrench } from "@/components/ui/Icons";

/**
 * One icon per category, picked from the collection handle or title.
 * Unknown categories get a plain box, so a new Shopify collection still looks right.
 */
export function CategoryIcon({ handle, title, className }: { handle: string; title?: string; className?: string }) {
  const key = `${handle} ${title ?? ""}`.toLowerCase();
  const props = { className, "aria-hidden": true as const };
  if (handle === "all") return <LayoutGrid {...props} />;
  if (/custom|personali|enquir|bespoke/.test(key)) return <Wrench {...props} />;
  if (/drawer|storage|organi[sz]er|box/.test(key)) return <Archive {...props} />;
  if (/desk|tech|office|study|work|stationery/.test(key)) return <LampDesk {...props} />;
  if (/home|living|decor|planter|kitchen|garden|fridge/.test(key)) return <House {...props} />;
  if (/gift|festive|season/.test(key)) return <Gift {...props} />;
  return <Box {...props} />;
}
