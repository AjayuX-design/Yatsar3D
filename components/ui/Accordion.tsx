"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Minus, Plus } from "@/components/ui/Icons";

export type AccordionItem = { id: string; title: string; content: ReactNode };

/**
 * Hairline rows, 56px tall, 250ms open. One row open at a time by default.
 * Closed panels are inert so they cannot take focus.
 */
export function Accordion({
  items,
  defaultOpenId = null,
  single = true,
  className,
}: {
  items: AccordionItem[];
  defaultOpenId?: string | null;
  single?: boolean;
  className?: string;
}) {
  const uid = useId();
  const [open, setOpen] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);

  const toggle = (id: string) =>
    setOpen((cur) =>
      cur.includes(id)
        ? cur.filter((x) => x !== id)
        : single
          ? [id]
          : [...cur, id],
    );

  return (
    <div className={cn("border-b border-line", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const buttonId = `${uid}-${item.id}-button`;
        const panelId = `${uid}-${item.id}-panel`;
        return (
          <div key={item.id} className="border-t border-line">
            <h2>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex min-h-14 lg:min-h-16 w-full items-center justify-between gap-4 py-2 text-left t-label text-ink"
              >
                <span className="text-[16px] leading-6 font-medium lg:text-[17px]">{item.title}</span>
                {isOpen ? (
                  <Minus className="size-5 shrink-0" aria-hidden="true" />
                ) : (
                  <Plus className="size-5 shrink-0" aria-hidden="true" />
                )}
              </button>
            </h2>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows] duration-[250ms] ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="pb-6 pr-8 t-body text-graphite lg:pb-8 lg:text-[17px] lg:leading-7">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
