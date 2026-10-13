// Mirror of the tokens in app/globals.css, used only to draw the preview.
// Keep in sync. scripts/check-tokens.mjs fails if they drift.

export const colorTokens = [
  { name: "page", hex: "#ffffff", use: "Page background" },
  { name: "surface", hex: "#ffffff", use: "Cards, inputs, drawer" },
  { name: "mist", hex: "#f4f4f3", use: "Light grey: image backing, info panels, chips" },
  { name: "line", hex: "#e5e5e3", use: "Hairlines, card borders" },
  { name: "ink", hex: "#171717", use: "Headings, primary text, primary button" },
  { name: "graphite", hex: "#5b5b5b", use: "Secondary text" },
  { name: "kiln", hex: "#c8501f", use: "Accent: large text, icons, focus ring only" },
  { name: "kiln-deep", hex: "#a33e14", use: "Accent for small text and links" },
  { name: "moss", hex: "#2f6b4f", use: "Ready to ship, WhatsApp, success" },
  { name: "moss-tint", hex: "#e4eee8", use: "Success background" },
  { name: "amber-text", hex: "#8a5a12", use: "Made to order text" },
  { name: "amber-dot", hex: "#b7791f", use: "Made to order dot, icons" },
  { name: "amber-tint", hex: "#f6ecd8", use: "Warning background" },
  { name: "slate", hex: "#3b5b73", use: "Delivery area notice" },
  { name: "slate-tint", hex: "#e3eaf0", use: "Info background" },
  { name: "error", hex: "#b3261e", use: "Errors" },
  { name: "error-tint", hex: "#f8e4e2", use: "Error background" },
] as const;

export const hex = Object.fromEntries(colorTokens.map((c) => [c.name, c.hex])) as Record<
  (typeof colorTokens)[number]["name"],
  string
>;

// Text on background pairs that the design actually uses.
export const contrastPairs: Array<{ text: keyof typeof hex; bg: keyof typeof hex; note: string }> = [
  { text: "ink", bg: "page", note: "Body and headings" },
  { text: "graphite", bg: "page", note: "Secondary text" },
  { text: "graphite", bg: "mist", note: "Helper text on panels" },
  { text: "surface", bg: "ink", note: "Primary button" },
  { text: "kiln-deep", bg: "page", note: "Small accent text, links" },
  { text: "kiln", bg: "page", note: "Accent text on white" },
  { text: "moss", bg: "moss-tint", note: "Ready to ship chip" },
  { text: "moss", bg: "surface", note: "WhatsApp button" },
  { text: "amber-text", bg: "amber-tint", note: "Made to order chip" },
  { text: "slate", bg: "slate-tint", note: "Delivery icon" },
  { text: "error", bg: "surface", note: "Error text" },
];

export const spacingSteps = [4, 8, 12, 16, 24, 32, 48, 64, 96];

export const radii = [
  { name: "ctl", px: 8, use: "Buttons, inputs" },
  { name: "card", px: 12, use: "Cards, image frames" },
  { name: "sheet", px: 16, use: "Sheet top corners" },
  { name: "pill", px: 999, use: "Chips" },
];

export const typeScale = [
  { cls: "t-display", name: "Display", spec: "Bricolage 700, 32/36, lg 48/52", sample: "Made layer by layer" },
  { cls: "t-h1", name: "H1", spec: "Bricolage 600, 28/32, lg 36/40", sample: "Pocket desk stand" },
  { cls: "t-h2", name: "H2", spec: "Bricolage 600, 22/28, lg 28/34", sample: "How custom printing works" },
  { cls: "t-h3", name: "H3", spec: "Bricolage 600, 18/24, lg 20/26", sample: "What is included" },
  { cls: "t-body-l", name: "Body L", spec: "Inter 400, 17/26, lg 18/28", sample: "Printed in PETG with a matte finish." },
  { cls: "t-body", name: "Body", spec: "Inter 400, 16/24", sample: "Fine layer lines are part of a printed surface." },
  { cls: "t-label", name: "UI label", spec: "Inter 500, 14/20", sample: "Production time" },
  { cls: "t-small", name: "Small", spec: "Inter 400, 14/20", sample: "We currently deliver to [area]." },
  { cls: "t-caption", name: "Caption", spec: "Inter 500, 12/16", sample: "Ready to ship" },
  { cls: "t-price-l", name: "Price L", spec: "Inter 600, 24/28, lg 28/32, tabular", sample: "₹1,299" },
  { cls: "t-price-s", name: "Price S", spec: "Inter 600, 16/24, tabular", sample: "₹1,299" },
  { cls: "t-spec", name: "Spec value", spec: "Inter 500, 14/20, tabular", sample: "180 x 95 x 42 mm" },
];
