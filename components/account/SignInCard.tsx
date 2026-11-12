import { Button } from "@/components/ui/Button";
import { PackageCheck, ReceiptText, Truck } from "@/components/ui/Icons";

const perks = [
  { Icon: PackageCheck, text: "See all your orders in one place" },
  { Icon: Truck, text: "Check status and tracking any time" },
  { Icon: ReceiptText, text: "Open receipts and get help with an order" },
];

/** The signed-out view of /account: what signing in gives you, and how it works. */
export function SignInCard({ next = "/account" }: { next?: string }) {
  return (
    <div className="rounded-card bg-mist p-6 lg:p-8">
      <h2 className="t-h2 text-ink">Sign in to see your orders</h2>
      <ul className="mt-5 space-y-3">
        {perks.map(({ Icon, text }) => (
          <li key={text} className="flex items-center gap-3 t-body text-ink">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-pill bg-kiln/10 text-kiln-deep">
              <Icon className="size-[18px]" />
            </span>
            {text}
          </li>
        ))}
      </ul>
      <Button href={`/account/login?next=${encodeURIComponent(next)}`} block className="mt-6 sm:w-auto">
        Sign in with email
      </Button>
      <p className="mt-3 max-w-[48ch] t-small text-graphite">
        We email you a one-time code. There is no password to remember. Use the email you ordered with, and your past orders appear. New here? The same button creates your account.
      </p>
    </div>
  );
}
