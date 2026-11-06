// Dates in India time, so an evening order is not shown as the next day by a server in another zone.
const base = { timeZone: "Asia/Kolkata" } as const;
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { ...base, day: "numeric", month: "short", year: "numeric" });
