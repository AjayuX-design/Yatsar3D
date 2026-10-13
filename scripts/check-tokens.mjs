// Fails if app/preview/tokens.ts colours drift from app/globals.css.
import { readFileSync } from "node:fs";

const css = readFileSync("app/globals.css", "utf8");
const ts = readFileSync("app/preview/tokens.ts", "utf8");

const fromCss = Object.fromEntries(
  [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6});/gi)].map((m) => [m[1], m[2].toLowerCase()]),
);
const fromTs = Object.fromEntries(
  [...ts.matchAll(/name:\s*"([a-z-]+)",\s*hex:\s*"(#[0-9a-f]{6})"/gi)].map((m) => [m[1], m[2].toLowerCase()]),
);

let bad = 0;
for (const [name, hex] of Object.entries(fromTs)) {
  if (fromCss[name] !== hex) {
    console.error(`Mismatch: ${name} preview=${hex} css=${fromCss[name]}`);
    bad++;
  }
}
console.log(`${Object.keys(fromTs).length} preview tokens checked, ${bad} mismatches.`);
process.exit(bad ? 1 : 0);
