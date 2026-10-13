// Generates MOCK product images (SVG, 4:5) so layouts can be tested with
// image-like content before real photography exists.
// These are illustrations, not photos. Replace with real photography.
// Run: node scripts/make-mock-images.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const W = 800;
const H = 1000;
mkdirSync("public/mock", { recursive: true });

const svg = (body, defsExtra = "", w = W, h = H) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f1ec"/><stop offset="1" stop-color="#ebe6de"/></linearGradient>
  <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcc9ae"/><stop offset="1" stop-color="#cdb594"/></linearGradient>
  <linearGradient id="white" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9c5bd"/><stop offset=".3" stop-color="#f4f2ee"/><stop offset=".5" stop-color="#ffffff"/><stop offset=".78" stop-color="#e8e5df"/><stop offset="1" stop-color="#c3bfb6"/></linearGradient>
  <linearGradient id="charcoal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a2a2a"/><stop offset=".35" stop-color="#4b4b4b"/><stop offset=".6" stop-color="#3d3d3d"/><stop offset="1" stop-color="#242424"/></linearGradient>
  <linearGradient id="charcoalTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a5a5a"/><stop offset="1" stop-color="#454545"/></linearGradient>
  <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b4137"/><stop offset="1" stop-color="#6a5c4d"/></linearGradient>
  <pattern id="layers" width="10" height="7" patternUnits="userSpaceOnUse"><rect y="5" width="10" height="2" fill="#000" opacity=".055"/></pattern>
  <pattern id="layersBig" width="20" height="16" patternUnits="userSpaceOnUse"><rect y="11" width="20" height="5" fill="#000" opacity=".07"/><rect y="9" width="20" height="2" fill="#fff" opacity=".35"/></pattern>
  <filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="blurS" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
  ${defsExtra}
</defs>
${body}
</svg>`;

const backdrop = `<rect width="${W}" height="${H}" fill="url(#wall)"/>`;
const room = `<rect width="${W}" height="${H}" fill="url(#wall)"/><rect y="720" width="${W}" height="280" fill="url(#desk)"/><rect y="716" width="${W}" height="6" fill="#000" opacity=".06"/>`;

// ---- objects. Each is drawn around (0,0) = centre of its base, y up is negative.
const pot = () => `
  <ellipse cx="0" cy="12" rx="205" ry="26" fill="#000" opacity=".28" filter="url(#blur)"/>
  <ellipse cx="0" cy="4" rx="178" ry="22" fill="#ece9e3" stroke="#d8d4cc"/>
  <path id="potBody" d="M-160 -330 L-120 0 Q0 28 120 0 L160 -330 Z" fill="url(#white)"/>
  <path d="M-160 -330 L-120 0 Q0 28 120 0 L160 -330 Z" fill="url(#layers)"/>
  <ellipse cx="0" cy="-330" rx="160" ry="30" fill="#fbfaf8" stroke="#dedad3"/>
  <ellipse cx="0" cy="-330" rx="143" ry="23" fill="url(#soil)"/>
  <ellipse cx="0" cy="-326" rx="143" ry="19" fill="#000" opacity=".12"/>`;

const plant = () => `
  <g transform="translate(0,-330)">
    <path d="M0 0 C-10 -90 -50 -150 -110 -190 C-70 -120 -30 -60 0 0Z" fill="#5f8660"/>
    <path d="M0 0 C10 -110 40 -190 100 -250 C80 -150 40 -70 0 0Z" fill="#6f9a6d"/>
    <path d="M0 0 C-4 -120 -10 -220 -30 -290 C10 -220 14 -110 0 0Z" fill="#547a56"/>
    <path d="M0 0 C40 -60 90 -90 150 -100 C100 -50 50 -20 0 0Z" fill="#7aa577"/>
    <path d="M0 0 C-50 -50 -110 -70 -160 -70 C-110 -30 -50 -10 0 0Z" fill="#628c63"/>
  </g>`;

const organiser = () => `
  <ellipse cx="0" cy="14" rx="285" ry="30" fill="#000" opacity=".3" filter="url(#blur)"/>
  <polygon points="215,-190 255,-250 255,-60 215,0" fill="#262626"/>
  <rect x="-215" y="-190" width="430" height="190" rx="10" fill="url(#charcoal)"/>
  <rect x="-215" y="-190" width="430" height="190" rx="10" fill="url(#layers)"/>
  <polygon points="-215,-190 -175,-250 255,-250 215,-190" fill="url(#charcoalTop)"/>
  <polygon points="-185,-198 -158,-240 -62,-240 -62,-198" fill="#151515"/>
  <polygon points="-48,-198 -48,-240 82,-240 82,-198" fill="#151515"/>
  <polygon points="96,-198 96,-240 232,-240 205,-198" fill="#151515"/>
  <rect x="-215" y="-196" width="430" height="6" fill="#fff" opacity=".08"/>`;

const pens = () => `
  <g>
    <rect x="-150" y="-330" width="12" height="130" rx="6" fill="#c8501f" transform="rotate(-8 -144 -200)"/>
    <rect x="-118" y="-345" width="12" height="150" rx="6" fill="#e8e4dc" transform="rotate(-2 -112 -200)"/>
    <rect x="130" y="-300" width="14" height="100" rx="7" fill="#2f6b4f" transform="rotate(6 137 -200)"/>
  </g>`;

const mug = () => `
  <ellipse cx="0" cy="8" rx="80" ry="12" fill="#000" opacity=".25" filter="url(#blurS)"/>
  <path d="M60 -90 q52 4 50 42 q-2 38 -50 40" fill="none" stroke="#e9e4d9" stroke-width="16"/>
  <rect x="-65" y="-150" width="130" height="150" rx="18" fill="url(#white)"/>
  <ellipse cx="0" cy="-150" rx="65" ry="12" fill="#fbfaf8" stroke="#dedad3"/>
  <ellipse cx="0" cy="-149" rx="55" ry="8" fill="#5b3f2c"/>`;

const place = (obj, x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${obj}</g>`;

const kraftBack = (x, y) => `<g transform="translate(${x} ${y})"><polygon points="-250,-190 -200,-270 200,-270 250,-190" fill="#b99869"/><rect x="-250" y="-200" width="500" height="60" fill="#a8885c"/></g>`;
const kraftFront = (x, y) => `
  <g transform="translate(${x} ${y})">
    <rect x="-250" y="-170" width="500" height="170" fill="#cdae83"/>
    <rect x="-250" y="-170" width="500" height="10" fill="#000" opacity=".1"/>
    <rect x="-40" y="-100" width="80" height="36" rx="4" fill="#f4efe6" opacity=".9"/>
  </g>`;

const phoneStand = () => `
  <ellipse cx="0" cy="12" rx="200" ry="24" fill="#000" opacity=".26" filter="url(#blur)"/>
  <g transform="rotate(-14 20 -200)">
    <rect x="-40" y="-390" width="150" height="300" rx="22" fill="#1b1b1d"/>
    <rect x="-33" y="-383" width="136" height="286" rx="16" fill="#2c3a46"/>
    <rect x="-33" y="-383" width="136" height="120" rx="16" fill="#ffffff" opacity=".07"/>
  </g>
  <polygon points="-120,-34 150,-34 118,-210 36,-210" fill="url(#white)"/>
  <polygon points="-120,-34 150,-34 118,-210 36,-210" fill="url(#layers)"/>
  <rect x="-170" y="-46" width="340" height="46" rx="14" fill="url(#white)"/>
  <rect x="-170" y="-46" width="340" height="46" rx="14" fill="url(#layers)"/>
  <rect x="-150" y="-100" width="46" height="56" rx="10" fill="#f0eee9" stroke="#dcd8d0"/>`;

const hanger = () => `
  <ellipse cx="-40" cy="14" rx="150" ry="20" fill="#000" opacity=".18" filter="url(#blur)"/>
  <rect x="-60" y="-420" width="120" height="420" rx="18" fill="url(#charcoal)"/>
  <rect x="-60" y="-420" width="120" height="420" rx="18" fill="url(#layers)"/>
  <path d="M40 -250 h120 a30 30 0 0 1 30 30 v70 a24 24 0 0 1 -48 0 v-52 h-102z" fill="url(#charcoal)"/>
  <circle cx="0" cy="-380" r="9" fill="#111"/><circle cx="0" cy="-60" r="9" fill="#111"/>`;

// ---- scenes
const scenes = {
  "planter-pot": {
    hero: svg(backdrop + place(pot(), 400, 760, 1.15)),
    scale: svg(room + place(pot(), 290, 790, 0.95) + place(mug(), 650, 790, 1.2)),
    closeup: svg(
      `<rect width="${W}" height="${H}" fill="url(#white)"/><rect width="${W}" height="${H}" fill="url(#layersBig)"/>
       <rect width="${W}" height="${H}" fill="#000" opacity=".03"/>
       <ellipse cx="400" cy="220" rx="520" ry="160" fill="#fff" opacity=".35" filter="url(#blur)"/>
       <rect x="0" y="0" width="90" height="${H}" fill="#000" opacity=".08" filter="url(#blur)"/>
       <rect x="710" y="0" width="90" height="${H}" fill="#000" opacity=".12" filter="url(#blur)"/>`,
    ),
    "in-use": svg(room + place(pot(), 400, 780, 1.05) + place(plant(), 400, 780, 1.05)),
    "in-box": svg(backdrop + kraftBack(400, 840) + place(pot(), 400, 810, 0.9) + kraftFront(400, 840)),
  },
  "desk-organiser": {
    hero: svg(backdrop + place(organiser(), 400, 700, 1.1)),
    scale: svg(room + place(organiser(), 285, 790, 0.9) + place(mug(), 660, 790, 1.2)),
    closeup: svg(
      `<rect width="${W}" height="${H}" fill="url(#charcoal)"/><rect width="${W}" height="${H}" fill="url(#layersBig)"/>
       <ellipse cx="400" cy="200" rx="520" ry="150" fill="#fff" opacity=".14" filter="url(#blur)"/>
       <rect x="710" y="0" width="90" height="${H}" fill="#000" opacity=".25" filter="url(#blur)"/>`,
    ),
    "in-use": svg(room + place(organiser() + pens(), 400, 780, 1.05)),
    "in-box": svg(backdrop + kraftBack(400, 840) + place(organiser(), 400, 820, 0.85) + kraftFront(400, 840)),
  },
};

scenes["phone-stand"] = { hero: svg(backdrop + place(phoneStand(), 400, 760, 1.25)) };
scenes["wall-mounted-headphone-and-cable-hanger-with-adjustable-arm"] = {
  hero: svg(`<rect width="${W}" height="${H}" fill="url(#wall)"/>` + place(hanger(), 360, 800, 1.1)),
};

for (const [product, views] of Object.entries(scenes)) {
  for (const [view, markup] of Object.entries(views)) {
    writeFileSync(`public/mock/${product}-${view}.svg`, markup);
  }
}
// Homepage hero: the same planter, larger in a wide frame, plain backdrop.
writeFileSync(
  "public/mock/hero-planter.svg",
  svg(`<rect width="1200" height="1000" fill="url(#wall)"/>` + place(pot(), 600, 800, 1.5), "", 1200, 1000),
);

console.log("Wrote", Object.values(scenes).reduce((n, v) => n + Object.keys(v).length, 0), "mock images to public/mock");
