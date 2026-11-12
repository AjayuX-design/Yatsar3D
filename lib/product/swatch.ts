/*
  Colour dots for colour options. Shopify only stores the colour's name, so the
  dot comes from the name. A name we do not know simply shows no dot.
  Names with extras still work ("Matte Black", "Dark Green" use the base colour).
*/

const COLOURS: Record<string, string> = {
  black: "#1c1c1c",
  white: "#f7f5f0",
  grey: "#9a9a98",
  gray: "#9a9a98",
  silver: "#c4c4c2",
  red: "#d6352b",
  orange: "#f08a24",
  yellow: "#f5c518",
  gold: "#c9a227",
  green: "#3f9b4f",
  mint: "#9fd9bb",
  teal: "#2a9d9a",
  cyan: "#3cc4d8",
  blue: "#2f6fd6",
  navy: "#1f2f5c",
  purple: "#7c4dbd",
  violet: "#8e5fd0",
  lavender: "#b9a3e3",
  plum: "#5b2a52",
  pink: "#f19ab8",
  magenta: "#c2307f",
  maroon: "#7a1f2b",
  brown: "#7b4b2a",
  tan: "#c8a27a",
  beige: "#e6d3b3",
  cream: "#f3ead6",
  ivory: "#f6f1e3",
  peach: "#f7c4a5",
  coral: "#f2735f",
  wood: "#c79a5f",
  natural: "#e3d2b0",
};

/** The dot colour for a colour name, or undefined if we do not know it. */
export function swatchFor(name: string): string | undefined {
  const words = name.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  // Last word first, so "Dark Green" is green and "Green Black" leans on the last colour named.
  for (let i = words.length - 1; i >= 0; i--) if (COLOURS[words[i]]) return COLOURS[words[i]];
  return undefined;
}

/** Dots for every value of an option, only when it is a colour option and every value is known. */
export function swatchesFor(optionName: string, values: string[]): Record<string, string> | undefined {
  if (!/colou?r/i.test(optionName)) return undefined;
  const out: Record<string, string> = {};
  for (const v of values) {
    const hex = swatchFor(v);
    if (hex) out[v] = hex;
  }
  return Object.keys(out).length ? out : undefined;
}
