"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitCustomOrder, type CustomOrderState } from "@/app/(store)/custom-print/actions";
import { WhatsAppButton } from "@/components/enquiry/WhatsAppButton";
import { Button } from "@/components/ui/Button";
import { Archive, Briefcase, Check, PenLine, X } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, REQUEST_TYPES, type RequestType } from "@/lib/custom-orders/request";

const typeIcons: Record<RequestType, typeof Archive> = { drawers: Archive, personalised: PenLine, business: Briefcase };

type Photo = { file: File; url: string };

/**
 * Shrinks a photo in the browser so three of them fit in one request and the
 * email stays small. Phones take 4 to 12 MB photos; this makes them about 300 KB.
 */
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  let scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  for (const quality of [0.82, 0.7, 0.6, 0.5]) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && blob.size <= MAX_PHOTO_BYTES) {
      bitmap.close();
      return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
    }
    scale *= 0.8;
  }
  bitmap.close();
  throw new Error("too large");
}

const input =
  "h-12 w-full rounded-ctl border bg-surface px-3 text-[16px] text-ink placeholder:text-graphite/70 aria-[invalid=true]:border-error border-line";

function Field({
  label,
  hint,
  error,
  optional,
  children,
  id,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block t-label text-ink">
        {label}
        {optional && <span className="font-normal text-graphite"> (optional)</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 t-small text-graphite">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 t-small text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function CustomOrderForm({ whatsappNumber }: { whatsappNumber?: string }) {
  const uid = useId();
  const [state, action, pending] = useActionState<CustomOrderState, FormData>(submitCustomOrder, { status: "idle" });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const [type, setType] = useState<RequestType | "">("");
  const fileInput = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const err = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;

  // Keep what the shopper chose when the server sends back an error.
  useEffect(() => {
    if (values?.type) setType(values.type);
  }, [values]);

  // Move focus to the confirmation so screen readers announce it.
  useEffect(() => {
    if (state.status === "ok") successRef.current?.focus();
  }, [state.status]);

  // Free the preview URLs when photos go away.
  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);

  const addPhotos = async (list: FileList | null) => {
    if (!list?.length) return;
    setPhotoNote(null);
    const room = MAX_PHOTOS - photos.length;
    const chosen = Array.from(list).slice(0, room);
    if (list.length > room) setPhotoNote(`You can add up to ${MAX_PHOTOS} photos.`);
    const added: Photo[] = [];
    for (const f of chosen) {
      try {
        const small = await shrink(f);
        added.push({ file: small, url: URL.createObjectURL(small) });
      } catch {
        setPhotoNote("We could not read one of those photos. Try another, or send it to us on WhatsApp.");
      }
    }
    setPhotos((cur) => [...cur, ...added]);
    if (fileInput.current) fileInput.current.value = "";
  };

  if (state.status === "ok") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="rounded-card border border-line bg-surface p-6 outline-none md:p-8">
        <span aria-hidden="true" className="grid size-11 place-items-center rounded-pill bg-moss-tint text-moss">
          <Check className="size-5" />
        </span>
        <h3 className="mt-4 t-h3 text-ink">Request received</h3>
        <p className="mt-2 t-body text-graphite">
          Your request number is{" "}
          <strong className="font-semibold text-ink [font-variant-numeric:tabular-nums]">{state.id}</strong>. We will reply with a quote by phone or
          WhatsApp. You pay nothing until you approve it.
        </p>
        <WhatsAppButton
          number={whatsappNumber}
          message={`Hi Yatsar 3D, I just sent custom order request ${state.id}. I'm messaging so you have my WhatsApp.`}
          label="Message us on WhatsApp"
          block={false}
          className="mt-5"
        />
      </div>
    );
  }

  return (
    <form
      noValidate
      action={(fd) => {
        fd.delete("photos");
        photos.forEach((p) => fd.append("photos", p.file));
        action(fd);
      }}
      className="space-y-5"
    >
      {/* Hidden trap field for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset>
        <legend className="mb-2 t-label text-ink">What do you need?</legend>
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-describedby={err?.type ? `${uid}-type-error` : undefined}>
          {REQUEST_TYPES.map((t) => {
            const Icon = typeIcons[t.key];
            const selected = type === t.key;
            return (
              <label
                key={t.key}
                className={cn(
                  "flex min-h-14 cursor-pointer items-center gap-3 rounded-ctl border px-3 t-label transition-colors duration-150",
                  selected ? "border-ink bg-mist text-ink" : "border-line text-ink hover:border-graphite/50",
                )}
              >
                <input type="radio" name="type" value={t.key} checked={selected} onChange={() => setType(t.key)} className="sr-only" />
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {t.label}
                {selected && <Check className="ml-auto size-4" aria-hidden="true" />}
              </label>
            );
          })}
        </div>
        {err?.type && (
          <p id={`${uid}-type-error`} role="alert" className="mt-1.5 t-small text-error">
            {err.type}
          </p>
        )}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${uid}-name`} label="Your name" error={err?.name}>
          <input id={`${uid}-name`} name="name" autoComplete="name" defaultValue={values?.name} aria-invalid={!!err?.name} aria-describedby={err?.name ? `${uid}-name-error` : undefined} className={input} />
        </Field>
        <Field id={`${uid}-phone`} label="Phone or WhatsApp number" error={err?.phone}>
          <input id={`${uid}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={values?.phone} aria-invalid={!!err?.phone} aria-describedby={err?.phone ? `${uid}-phone-error` : undefined} className={input} />
        </Field>
        <Field id={`${uid}-city`} label="City" error={err?.city}>
          <input id={`${uid}-city`} name="city" autoComplete="address-level2" defaultValue={values?.city} aria-invalid={!!err?.city} aria-describedby={err?.city ? `${uid}-city-error` : undefined} className={input} />
        </Field>
        <Field id={`${uid}-email`} label="Email" optional error={err?.email}>
          <input id={`${uid}-email`} name="email" type="email" inputMode="email" autoComplete="email" defaultValue={values?.email} aria-invalid={!!err?.email} aria-describedby={err?.email ? `${uid}-email-error` : undefined} className={input} />
        </Field>
      </div>

      <Field id={`${uid}-details`} label="Tell us what you want" error={err?.details} hint="What it is for, what it should look like, any text or logo.">
        <textarea
          id={`${uid}-details`}
          name="details"
          rows={5}
          defaultValue={values?.details}
          aria-invalid={!!err?.details}
          aria-describedby={`${uid}-details-${err?.details ? "error" : "hint"}`}
          className={cn(input, "h-auto min-h-32 py-3")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${uid}-size`} label="Size" optional hint="For a drawer: inside length, width and depth.">
          <input id={`${uid}-size`} name="size" defaultValue={values?.size} aria-describedby={`${uid}-size-hint`} className={input} />
        </Field>
        <Field id={`${uid}-qty`} label="How many" optional>
          <input id={`${uid}-qty`} name="quantity" inputMode="numeric" defaultValue={values?.quantity} className={input} />
        </Field>
      </div>

      <div>
        <p className="mb-1.5 t-label text-ink">
          Photos or a sketch <span className="font-normal text-graphite">(optional)</span>
        </p>
        <ul className="mb-3 flex flex-wrap gap-3">
          {photos.map((p, i) => (
            <li key={p.url} className="relative size-20 overflow-hidden rounded-ctl border border-line bg-mist">
              {/* A local preview, not a site image, so a plain img is right. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Photo ${i + 1}`} className="size-full object-cover" />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => setPhotos((cur) => cur.filter((x) => x !== p))}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-pill bg-surface/90 text-ink hover:bg-surface"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        {photos.length < MAX_PHOTOS && (
          <>
            <input ref={fileInput} id={`${uid}-photos`} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => void addPhotos(e.target.files)} />
            <label
              htmlFor={`${uid}-photos`}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-ctl border border-line px-4 t-label text-ink hover:border-graphite/50 focus-within:outline-2"
            >
              Add photos
            </label>
          </>
        )}
        <p className="mt-1.5 t-small text-graphite" role={photoNote ? "alert" : undefined}>
          {photoNote ?? `Up to ${MAX_PHOTOS} photos. They are made smaller on your phone before sending.`}
        </p>
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p role="alert" className="rounded-ctl bg-error-tint px-3 py-2 t-small text-error">
          {state.message}
        </p>
      )}

      <div>
        <Button type="submit" loading={pending} block className="sm:w-auto sm:min-w-[220px]">
          Send request
        </Button>
        <p className="mt-3 t-small text-graphite">We use these details only to reply to your request. No payment is taken here.</p>
      </div>
    </form>
  );
}
