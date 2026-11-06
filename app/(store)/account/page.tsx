import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountNav } from "@/components/account/AccountNav";
import { OrderCard } from "@/components/account/OrderCard";
import { SignInCard } from "@/components/account/SignInCard";
import { SignOutButton } from "@/components/account/SignOutButton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { InfoCard } from "@/components/ui/InfoCard";
import { StatePanel } from "@/components/ui/StatePanel";
import { getAccount } from "@/lib/customer/account";

export const metadata: Metadata = { title: "My account | Yatsar 3D", robots: { index: false, follow: false } };

const notices: Record<string, string> = {
  cancelled: "Sign-in was cancelled. You can try again whenever you like.",
  signin: "We could not sign you in. Please try again.",
};

export default function AccountPage(props: PageProps<"/account">) {
  return (
    <main id="main" tabIndex={-1} className="outline-none mx-auto w-full max-w-[1200px] px-4 pb-8 pt-2 md:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My account" }]} />
      <Suspense fallback={<div aria-busy="true" aria-label="Loading your account" className="mt-6 h-64 rounded-card bg-mist" />}>
        <Content searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function Content({ searchParams }: { searchParams: PageProps<"/account">["searchParams"] }) {
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const notice = notices[one(q.error) ?? ""];
  const a = await getAccount();

  if (a.state === "refresh" && !one(q.refreshed)) redirect("/account/refresh?next=/account");

  if (a.state === "unavailable") {
    return (
      <StatePanel title="Accounts are coming soon" className="mt-8" action={<Button href="/track-order" variant="secondary">Track an order</Button>}>
        For now, find your order status in the email we sent, or ask us.
      </StatePanel>
    );
  }

  if (a.state === "signed-out" || a.state === "refresh") {
    return (
      <>
        <h1 className="mt-2 t-h1 text-ink">My account</h1>
        {notice && (
          <div className="mt-6 max-w-[640px]">
            <InfoCard variant="amber">{notice}</InfoCard>
          </div>
        )}
        <div className="mt-6 max-w-[640px]">
          <SignInCard />
        </div>
      </>
    );
  }

  if (a.state === "error") {
    return (
      <StatePanel tone="error" title="Your orders could not be loaded" className="mt-8" action={<Button href="/account" variant="secondary">Try again</Button>}>
        {a.message}
      </StatePanel>
    );
  }

  const { customer } = a;
  return (
    <>
      <header className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-h1 text-ink">{customer.firstName ? `Hi, ${customer.firstName}` : "My account"}</h1>
          {customer.email && <p className="mt-1 t-small text-graphite">{customer.email}</p>}
        </div>
        <SignOutButton />
      </header>

      <AccountNav current="/account" />

      <section className="mt-8" aria-labelledby="orders">
        <h2 id="orders" className="t-h2 text-ink">
          Your orders
        </h2>
        {customer.orders.length === 0 ? (
          <StatePanel title="No orders yet" className="mt-6 mx-0" action={<Button href="/collections/all">Shop all products</Button>}>
            Orders you place with this email will show up here.
          </StatePanel>
        ) : (
          <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:gap-6">
            {customer.orders.map((o) => (
              <li key={o.id}>
                <OrderCard order={o} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
