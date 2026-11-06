export type Review = {
  id: string;
  /** Product handle the review belongs to. */
  handle: string;
  name: string;
  /** Whole stars, 1 to 5. */
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  /** "live" shows on the site at once. The owner can hide a review later. */
  status: "live" | "hidden";
  reply?: { text: string; at: string };
};

export type Rating = {
  /** Average of live reviews, one decimal. */
  average: number;
  count: number;
  /** How many reviews gave 1, 2, 3, 4 and 5 stars. */
  counts: [number, number, number, number, number];
};
