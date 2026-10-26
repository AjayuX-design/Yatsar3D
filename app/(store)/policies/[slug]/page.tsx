import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { POLICY_UPDATED, getPolicy, policies } from "@/lib/policies";

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const policy = getPolicy(slug);
  if (!policy) return { title: "Policy | Yatsar 3D" };
  // Kept out of search results until the shop confirms the final wording.
  return { title: `${policy.title} | Yatsar 3D`, description: policy.summary, robots: { index: false, follow: true } };
}

export default async function PolicyPage(props: PageProps<"/policies/[slug]">) {
  const { slug } = await props.params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pb-8 pt-2 md:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: policy.title }]} />

      <article className="max-w-[720px]">
        <header className="mt-2">
          <h1 className="t-h1 text-ink">{policy.title}</h1>
          <p className="mt-3 t-body-l text-graphite">{policy.summary}</p>
          <p className="mt-3 t-small text-graphite">Last updated {POLICY_UPDATED}</p>
        </header>

        <div className="mt-10 space-y-10">
          {policy.sections.map((s) => (
            <section key={s.heading} aria-labelledby={`s-${s.heading.replace(/\W+/g, "-").toLowerCase()}`}>
              <h2 id={`s-${s.heading.replace(/\W+/g, "-").toLowerCase()}`} className="t-h3 text-ink">
                {s.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {s.body.map((b, i) =>
                  typeof b === "string" ? (
                    <p key={i} className="max-w-[56ch] t-body text-graphite lg:text-[17px] lg:leading-7">
                      {b}
                    </p>
                  ) : (
                    <ul key={i} className="max-w-[56ch] list-disc space-y-2 pl-5 t-body text-graphite marker:text-graphite/60 lg:text-[17px] lg:leading-7">
                      {b.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </article>

      <nav aria-label="Other policies" className="mt-12 max-w-[720px] border-t border-line pt-6">
        <h2 className="t-label text-graphite">Other policies</h2>
        <ul className="mt-2 flex flex-wrap gap-x-6">
          {policies
            .filter((p) => p.slug !== policy.slug)
            .map((p) => (
              <li key={p.slug}>
                <Link href={`/policies/${p.slug}`} className="inline-flex min-h-11 items-center t-small text-ink underline underline-offset-[3px]">
                  {p.title}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </main>
  );
}
