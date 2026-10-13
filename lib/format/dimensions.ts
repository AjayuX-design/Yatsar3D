import type { Dimensions } from "../types";

const cm = (mm: number) => `${+(mm / 10).toFixed(1)}`;

/** Returns null unless all three sides are known. mm is primary, cm is the helper. */
export function formatDimensions(d?: Dimensions) {
  if (!d?.lengthMm || !d.widthMm || !d.heightMm) return null;
  const { lengthMm: l, widthMm: w, heightMm: h } = d;
  return {
    mm: `${l} x ${w} x ${h} mm`,
    cm: `${cm(l)} x ${cm(w)} x ${cm(h)} cm`,
  };
}

/** Longest side in cm, for the short spec line on product cards. */
export function longestSideCm(d?: Dimensions) {
  const sides = [d?.lengthMm, d?.widthMm, d?.heightMm].filter((n): n is number => !!n);
  return sides.length ? cm(Math.max(...sides)) : null;
}
