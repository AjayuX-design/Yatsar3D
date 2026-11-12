import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WorstCase } from "./WorstCase";

export const metadata: Metadata = { title: "Worst-case data", robots: { index: false, follow: false } };

/** Dev and preview only. ?data=demo | worst | empty | one */
export default function Page(props: PageProps<"/preview/worst">) {
  if (process.env.VERCEL_ENV === "production") notFound();
  return (
    <Suspense>
      <Data searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Data({ searchParams }: { searchParams: PageProps<"/preview/worst">["searchParams"] }) {
  const { data } = await searchParams;
  const mode = (["demo", "worst", "empty", "one"] as const).find((m) => m === data) ?? "worst";
  return <WorstCase mode={mode} />;
}
