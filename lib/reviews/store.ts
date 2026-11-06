import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Rating, Review } from "./types";
import { summarise } from "./validate";

/*
  Where reviews are kept.
    redis: Upstash Redis (added from the Vercel Marketplace). Used when its keys are set.
    file:  a JSON file in .data/, for local development only.
    none:  production without a database. The review section stays hidden, so nothing looks broken.
*/

export type StoreKind = "redis" | "file" | "none";

const redisUrl = () => process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken = () => process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export function storeKind(): StoreKind {
  if (redisUrl() && redisToken()) return "redis";
  return process.env.NODE_ENV !== "production" ? "file" : "none";
}

/* ---------- Redis (REST) ---------- */

async function cmd<T = unknown>(...args: (string | number)[]): Promise<T> {
  const res = await fetch(redisUrl()!, {
    method: "POST",
    headers: { Authorization: `Bearer ${redisToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const json = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || json.error) throw new Error(json.error ?? `Redis error ${res.status}`);
  return json.result as T;
}

const parse = (v: unknown): Review | null => {
  try {
    return typeof v === "string" ? (JSON.parse(v) as Review) : null;
  } catch {
    return null;
  }
};

async function redisMany(ids: string[]): Promise<Review[]> {
  if (!ids.length) return [];
  const rows = await cmd<(string | null)[]>("MGET", ...ids.map((id) => `review:${id}`));
  return rows.map(parse).filter((r): r is Review => !!r);
}

const redisBackend = {
  async byHandle(handle: string) {
    return redisMany(await cmd<string[]>("ZREVRANGE", `reviews:p:${handle}`, 0, -1));
  },
  async all() {
    return redisMany(await cmd<string[]>("ZREVRANGE", "reviews:all", 0, 499));
  },
  async get(id: string) {
    return parse(await cmd("GET", `review:${id}`));
  },
  async put(r: Review) {
    const score = Date.parse(r.createdAt);
    await cmd("SET", `review:${r.id}`, JSON.stringify(r));
    await cmd("ZADD", "reviews:all", score, r.id);
    await cmd("ZADD", `reviews:p:${r.handle}`, score, r.id);
    await redisBackend.refreshRating(r.handle);
  },
  async del(r: Review) {
    await cmd("DEL", `review:${r.id}`);
    await cmd("ZREM", "reviews:all", r.id);
    await cmd("ZREM", `reviews:p:${r.handle}`, r.id);
    await redisBackend.refreshRating(r.handle);
  },
  async refreshRating(handle: string) {
    await cmd("SET", `rating:${handle}`, JSON.stringify(summarise(await redisBackend.byHandle(handle))));
  },
  async ratings(handles: string[]) {
    const out: Record<string, Rating> = {};
    if (!handles.length) return out;
    const rows = await cmd<(string | null)[]>("MGET", ...handles.map((h) => `rating:${h}`));
    rows.forEach((v, i) => {
      if (typeof v === "string") out[handles[i]] = JSON.parse(v) as Rating;
    });
    return out;
  },
};

/* ---------- File (local development) ---------- */

const file = path.join(process.cwd(), ".data", "reviews.json");

async function readFileStore(): Promise<Review[]> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as Review[];
  } catch {
    return [];
  }
}
async function writeFileStore(rows: Review[]) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(rows, null, 2));
}
const newest = (rows: Review[]) => [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

const fileBackend = {
  async byHandle(handle: string) {
    return newest((await readFileStore()).filter((r) => r.handle === handle));
  },
  async all() {
    return newest(await readFileStore());
  },
  async get(id: string) {
    return (await readFileStore()).find((r) => r.id === id) ?? null;
  },
  async put(r: Review) {
    const rows = (await readFileStore()).filter((x) => x.id !== r.id);
    await writeFileStore([...rows, r]);
  },
  async del(r: Review) {
    await writeFileStore((await readFileStore()).filter((x) => x.id !== r.id));
  },
  async ratings(handles: string[]) {
    const rows = await readFileStore();
    const out: Record<string, Rating> = {};
    for (const h of handles) {
      const s = summarise(rows.filter((r) => r.handle === h));
      if (s.count) out[h] = s;
    }
    return out;
  },
};

const backend = () => (storeKind() === "redis" ? redisBackend : fileBackend);

/* ---------- Public API ---------- */

/** Live reviews for one product, newest first. Empty when there is no store. */
export async function liveReviews(handle: string): Promise<Review[]> {
  if (storeKind() === "none") return [];
  return (await backend().byHandle(handle)).filter((r) => r.status === "live");
}

/** Ratings for a set of products. Products with no reviews are left out. */
export async function ratingsFor(handles: string[]): Promise<Record<string, Rating>> {
  if (storeKind() === "none" || !handles.length) return {};
  try {
    return await backend().ratings(handles);
  } catch {
    // A review outage must never break a product page.
    return {};
  }
}

export const allReviews = () => backend().all();
export const getReview = (id: string) => backend().get(id);
export const saveReview = (r: Review) => backend().put(r);
export const removeReview = (r: Review) => backend().del(r);
