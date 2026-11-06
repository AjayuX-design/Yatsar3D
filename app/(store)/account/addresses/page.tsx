import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountNav } from "@/components/account/AccountNav";
import { AddressBook } from "@/components/account/AddressBook";
import { SignInCard } from "@/components/account/SignInCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { StatePanel } from "@/components/ui/StatePanel";
import { getAddresses } from "@/lib/customer/account";

export const metadata: Metadata = { title: "Saved addresses | Yatsar 3D", robots: { index: false, follow: false } };

export default function AddressesPage(props: PageProps<"/account/addresses">) {
  return (
    <main id="main" tabIndex={-1} className="outline-none mx-auto w-full max-w-[1200px] px-4 pb-8 pt-2 md:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My account", href: "/account" }, { label: "Saved addresses" }]} />
      <Suspense fallback={<div aria-busy="true" aria-label="Loading your addresses" className="mt-6 h-64 rounded-card bg-mist" />}>
        <Content searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function Content({ searchParams }: { searchParams: PageProps<"/account/addresses">["searchParams"] }) {
  const q = await searchParams;
  const a = await getAddresses();

  if (a.state === "refresh" && !q.refreshed) redirect("/account/refresh?next=/account/addresses");
  if (a.state === "unavailable") redirect("/account");
  if (a.state === "signed-out" || a.state === "refresh") {
    return (
      <div className="mt-6 max-w-[640px]">
        <SignInCard next="/account/addresses" />
      </div>
    );
  }
  if (a.state === "error") {
    return (
      <StatePanel tone="error" title="Your addresses could not be loaded" className="mt-8" action={<Button href="/account/addresses" variant="secondary">Try again</Button>}>
        {a.message}
      </StatePanel>
    );
  }

  return (
    <>
      <h1 className="mt-2 t-h1 text-ink">Saved addresses</h1>
      <p className="mt-2 max-w-[56ch] t-body text-graphite">Your default address and email fill in checkout for you, so ordering takes fewer taps.</p>
      <AccountNav current="/account/addresses" />
      <div className="mt-6">
        <AddressBook addresses={a.addresses} />
        {a.demo && <p className="mt-4 t-small text-graphite">Demo mode: changes are not saved.</p>}
      </div>
    </>
  );
}
