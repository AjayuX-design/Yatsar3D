"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MapPin, Plus } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { makeDefaultAddress, removeAddress, saveAddress, type AddressState } from "@/lib/customer/address-actions";
import { STATES, type SavedAddress } from "@/lib/customer/addresses";

const input =
  "h-12 w-full rounded-ctl border border-field bg-surface px-3 text-[16px] text-ink placeholder:text-hint aria-[invalid=true]:border-error";

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block t-label text-ink">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 t-small text-error">{error}</p> : hint ? <p className="mt-1 t-caption text-graphite">{hint}</p> : null}
    </div>
  );
}

/** Add or change one address. India only: state, PIN code and a 10-digit mobile. */
function AddressForm({ address, first, onDone }: { address?: SavedAddress; first: boolean; onDone: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<AddressState, FormData>(saveAddress, { status: "idle" });
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const v = state.status === "error" ? (state.values ?? {}) : {};
  const initial = (k: keyof SavedAddress, fallback = "") => v[k as string] ?? (address?.[k] as string | undefined) ?? fallback;
  const id = address?.id ?? "new";

  useEffect(() => {
    if (state.status === "ok") {
      router.refresh();
      onDone();
    }
  }, [state, router, onDone]);

  return (
    <form action={action} className="space-y-4 rounded-card border border-line p-4 lg:p-5" noValidate>
      <p className="t-h3 text-ink">{address ? "Edit address" : "New address"}</p>
      {address && <input type="hidden" name="id" value={address.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-fn`} label="First name" error={errors.firstName}>
          <input id={`${id}-fn`} name="firstName" autoComplete="given-name" defaultValue={initial("firstName")} aria-invalid={!!errors.firstName} className={input} />
        </Field>
        <Field id={`${id}-ln`} label="Last name" error={errors.lastName}>
          <input id={`${id}-ln`} name="lastName" autoComplete="family-name" defaultValue={initial("lastName")} aria-invalid={!!errors.lastName} className={input} />
        </Field>
      </div>
      <Field id={`${id}-ph`} label="Mobile number" error={errors.phone} hint="For the courier. 10 digits.">
        <input
          id={`${id}-ph`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          defaultValue={v.phone ?? address?.phoneNumber?.replace(/^\+91/, "") ?? ""}
          aria-invalid={!!errors.phone}
          className={input}
        />
      </Field>
      <Field id={`${id}-a1`} label="House number and street" error={errors.address1}>
        <input id={`${id}-a1`} name="address1" autoComplete="address-line1" defaultValue={initial("address1")} aria-invalid={!!errors.address1} className={input} />
      </Field>
      <Field id={`${id}-a2`} label="Apartment, area or landmark (optional)" error={errors.address2}>
        <input id={`${id}-a2`} name="address2" autoComplete="address-line2" defaultValue={initial("address2")} aria-invalid={!!errors.address2} className={input} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id={`${id}-city`} label="City" error={errors.city}>
          <input id={`${id}-city`} name="city" autoComplete="address-level2" defaultValue={initial("city")} aria-invalid={!!errors.city} className={input} />
        </Field>
        <Field id={`${id}-st`} label="State" error={errors.state}>
          <select id={`${id}-st`} name="state" defaultValue={v.state ?? address?.zoneCode ?? ""} aria-invalid={!!errors.state} className={input}>
            <option value="">Choose</option>
            {STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id={`${id}-zip`} label="PIN code" error={errors.zip}>
          <input id={`${id}-zip`} name="zip" inputMode="numeric" autoComplete="postal-code" maxLength={6} defaultValue={initial("zip")} aria-invalid={!!errors.zip} className={input} />
        </Field>
      </div>
      <p className="t-small text-graphite">Country: India</p>
      {(first || !address?.isDefault) && (
        <label className="flex min-h-11 items-center gap-3 t-body text-ink">
          <input type="checkbox" name="makeDefault" defaultChecked={first} className="size-5 accent-ink" />
          Use as my default address
        </label>
      )}
      {state.status === "error" && !state.fieldErrors && (
        <p role="alert" className="t-small text-error">
          {state.message}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button type="submit" loading={pending} block className="sm:w-auto">
          Save address
        </Button>
        <Button type="button" variant="text" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** The list of saved addresses, with add, edit, delete and make-default. */
export function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  // "new", an address id, or null when no form is open.
  const [open, setOpen] = useState<string | null>(null);
  const close = () => setOpen(null);
  const button = "inline-flex min-h-11 items-center px-1 t-label text-ink underline underline-offset-[3px]";

  return (
    <div>
      {addresses.length === 0 && open !== "new" && (
        <div className="rounded-card bg-mist p-6 text-center">
          <p className="t-h3 text-ink">No saved addresses yet</p>
          <p className="mt-2 t-small text-graphite">Save one here and checkout opens already filled in.</p>
        </div>
      )}

      <ul className="grid gap-3 md:grid-cols-2 lg:gap-6">
        {addresses.map((a) =>
          open === a.id ? (
            <li key={a.id} className="md:col-span-2">
              <AddressForm address={a} first={false} onDone={close} />
            </li>
          ) : (
            <li key={a.id} className="flex flex-col rounded-card border border-line p-4 lg:p-5">
              <div className="flex items-center justify-between gap-2">
                <span aria-hidden="true" className="grid size-9 place-items-center rounded-pill bg-kiln/10 text-kiln-deep">
                  <MapPin className="size-[18px]" />
                </span>
                {a.isDefault && <span className="rounded-pill bg-moss-tint px-3 py-1 t-caption text-moss">Default</span>}
              </div>
              <address className="mt-3 flex-1 not-italic t-body text-ink">
                {a.formatted.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              {a.phoneNumber && <p className="mt-2 t-small text-graphite [font-variant-numeric:tabular-nums]">{a.phoneNumber}</p>}
              <div className={cn("mt-3 flex flex-wrap items-center gap-x-4 border-t border-line pt-1")}>
                <button type="button" className={button} onClick={() => setOpen(a.id)}>
                  Edit
                </button>
                {!a.isDefault && (
                  <form action={makeDefaultAddress}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className={button}>
                      Make default
                    </button>
                  </form>
                )}
                <form
                  action={removeAddress}
                  onSubmit={(e) => {
                    if (!confirm("Delete this address?")) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className={cn(button, "text-error")}>
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ),
        )}
      </ul>

      <div className="mt-4">
        {open === "new" ? (
          <AddressForm first={addresses.length === 0} onDone={close} />
        ) : (
          <Button variant="secondary" icon={<Plus className="size-5" aria-hidden="true" />} onClick={() => setOpen("new")} block className="sm:w-auto">
            Add an address
          </Button>
        )}
      </div>
    </div>
  );
}
