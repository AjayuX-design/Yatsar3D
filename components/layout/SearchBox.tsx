"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Search } from "@/components/ui/Icons";
import { suggestProducts, type Suggestion } from "@/lib/product/suggest";

/**
 * Search field with a short list of matching products as you type.
 * Enter with nothing highlighted still goes to the full results page, so it
 * works without the list. Arrow keys move through the list, Escape closes it.
 */
export function SearchBox({
  id,
  inputClass,
  iconClass,
  defaultValue = "",
  placeholder = "Search",
  autoFocus,
}: {
  id: string;
  inputClass: string;
  iconClass: string;
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState(defaultValue);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrap = useRef<HTMLDivElement>(null);
  const latest = useRef(0);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      return;
    }
    const n = ++latest.current;
    const t = setTimeout(async () => {
      const r = await suggestProducts(term).catch(() => []);
      if (n === latest.current) {
        setItems(r);
        setActive(-1);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  // Close when focus or a click leaves the box.
  useEffect(() => {
    const away = (e: Event) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, []);

  const show = open && items.length > 0;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return setOpen(false);
    if (!show) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      setOpen(false);
      router.push(`/products/${items[active].handle}`);
    }
  };

  return (
    <div ref={wrap} className="relative min-w-0 flex-1" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <Search aria-hidden="true" className={iconClass} />
      <input
        id={id}
        name="q"
        type="search"
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={show && active >= 0 ? `${listId}-${active}` : undefined}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        autoComplete="off"
        autoFocus={autoFocus}
        enterKeyHint="search"
        placeholder={placeholder}
        className={inputClass}
      />
      <p role="status" className="sr-only">
        {show ? `${items.length} ${items.length === 1 ? "suggestion" : "suggestions"} available. Use the up and down arrows.` : ""}
      </p>
      <div
        hidden={!show}
        className="absolute left-0 top-full z-40 mt-2 w-[min(340px,calc(100vw-32px))] overflow-hidden rounded-card border border-line bg-surface shadow-[0_12px_32px_-12px_rgba(23,23,23,0.3)]"
      >
        <ul id={listId} role="listbox" aria-label="Matching products">
          {items.map((s, i) => (
            <li key={s.handle} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
              <a
                href={`/products/${s.handle}`}
                tabIndex={-1}
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  router.push(`/products/${s.handle}`);
                }}
                className={`flex min-h-14 items-center gap-3 px-3 py-2 ${i === active ? "bg-mist" : "hover:bg-mist"}`}
              >
                <span className="relative size-10 shrink-0 overflow-hidden rounded-ctl bg-mist">
                  {s.image && <Image src={s.image} alt="" fill sizes="40px" className="object-cover mix-blend-multiply" />}
                </span>
                <span className="min-w-0 flex-1 truncate t-small font-semibold text-ink">{s.title}</span>
                <span className="shrink-0 whitespace-nowrap t-small text-graphite [font-variant-numeric:tabular-nums]">{s.price}</span>
              </a>
            </li>
          ))}
        </ul>
        <button type="submit" className="flex min-h-11 w-full items-center border-t border-line px-3 t-small font-medium text-kiln-deep hover:bg-mist">
          See all results
        </button>
      </div>
    </div>
  );
}
