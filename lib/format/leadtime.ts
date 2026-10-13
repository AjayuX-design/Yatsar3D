import type { Days } from "../types";

/** "2 to 3 days", "1 day", "2 days". Tabular numerals are applied in the UI. */
export function formatDays({ min, max }: Days) {
  const unit = (n: number) => (n === 1 ? "day" : "days");
  return min === max ? `${min} ${unit(max)}` : `${min} to ${max} ${unit(max)}`;
}
