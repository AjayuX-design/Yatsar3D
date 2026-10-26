"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitCustomOrder, type CustomOrderState } from "@/app/(store)/custom-print/actions";
import { WhatsAppButton } from "@/components/enquiry/WhatsAppButton";
import { Button } from "@/components/ui/Button";
import { Archive, ArrowLeft, ArrowRight, Briefcase, Camera, Check, Copy, Pencil, PenLine, Send, ShieldCheck, X } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import {
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  REQUEST_TYPES,
  readFields,
  validateFields,
  type RequestType,
} from "@/lib/custom-orders/request";

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

const missingLabels: Record<string, string> = {
  type: "what you need",
  size: "the drawer size",
  details: "a few details",
  name: "your name",
  phone: "a phone number",
  city: "your city",
  email: "a valid email",
};

/** Which step each missing item belongs to. */
const stepOf: Record<string, 1 | 2 | 3> = { type: 1, size: 2, details: 2, name: 3, phone: 3, city: 3, email: 3 };

const input =
  "h-12 w-full rounded-ctl border bg-surface px-3 text-[16px] text-ink placeholder:text-graphite/70 aria-[invalid=true]:border-error border-line";

const steps = [
  { n: 1, label: "Choose", title: "What do you need?", help: "Pick the one that fits best." },
  { n: 2, label: "Describe", title: "Tell us about it", help: "A few quick details so we can quote." },
  { n: 3, label: "Contact", title: "Where can we reach you?", help: "We reply with your quote. No payment now." },
] as const;

/** Words and colours for each choice, so each one is recognisable at a glance. */
const typeCopy: Record<RequestType, { short: string; detailsLabel: string; placeholder: string; tint: string }> = {
  drawers: {
    short: "Made to your drawer's exact size",
    detailsLabel: "What will it hold?",
    placeholder: "For example: cutlery, three sections, matte black",
    tint: "bg-slate-tint text-slate",
  },
  personalised: {
    short: "Names, dates, logos or messages",
    detailsLabel: "What should we print, and on what?",
    placeholder: "For example: the name Asha on a fridge magnet, plum colour",
    tint: "bg-amber-tint text-amber-text",
  },
  business: {
    short: "Branded items and bulk orders",
    detailsLabel: "What do you need?",
    placeholder: "For example: 50 desk organisers with our logo",
    tint: "bg-moss-tint text-moss",
  },
};

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
      <label htmlFor={id} className="mb-2 block t-label text-ink">
        {label}
        {optional && <span className="font-normal text-graphite"> (optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 t-small text-graphite">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 t-small text-error">
          {error}
        </p>
      )}
    </div>
  );
}


/** Three segments that show where you are. Finished steps get a tick. */
function Progress({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
      {steps.map((s) => {
        const done = s.n < step;
        const current = s.n === step;
        return (
          <li key={s.n} aria-current={current ? "step" : undefined}>
            <span className={cn("block h-1 rounded-pill transition-colors duration-200", done || current ? "bg-ink" : "bg-line")} />
            <span className={cn("mt-2 flex items-center gap-2 t-caption", current ? "text-ink" : "text-graphite")}>
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-5 place-items-center rounded-pill text-[11px] font-semibold leading-none",
                  done || current ? "bg-ink text-surface" : "bg-mist text-graphite",
                )}
              >
                {done ? <Check className="size-3" /> : s.n}
              </span>
              {s.label}
              <span className="sr-only">{done ? " (done)" : current ? " (current step)" : ""}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Remounts the form to start again, so a second request begins from a clean slate. */
export function CustomOrderForm({ whatsappNumber }: { whatsappNumber?: string }) {
  const [round, setRound] = useState(0);
  return <CustomOrderFormInner key={round} whatsappNumber={whatsappNumber} onReset={() => setRound((r) => r + 1)} />;
}

type Sent = { typeLabel: string; size?: string; photos: number; city: string; phone: string; quantity?: string };

function CustomOrderFormInner({ whatsappNumber, onReset }: { whatsappNumber?: string; onReset: () => void }) {
  const uid = useId();
  const [sent, setSent] = useState<Sent | null>(null);
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState<CustomOrderState, FormData>(submitCustomOrder, { status: "idle" });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const [type, setType] = useState<RequestType | "">("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dims, setDims] = useState({ l: "", w: "", d: "" });
  const [company, setCompany] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const [missing, setMissing] = useState<string[]>(["type", "details", "name", "phone", "city"]);

  const err = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;
  const copy = type ? typeCopy[type] : null;
  const typeLabel = REQUEST_TYPES.find((t) => t.key === type)?.label;

  // What is still missing, in the order of the form.
  const check = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const errors = validateFields(readFields((n) => data.get(n)));
    const list: string[] = [];
    if (errors.type) list.push("type");
    if (type === "drawers" && !(dims.l && dims.w && dims.d)) list.push("size");
    if (errors.details) list.push("details");
    for (const k of ["name", "phone", "city", "email"] as const) if (errors[k]) list.push(k);
    setMissing(list);
  };

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, type, dims]);

  // Keep what the shopper chose, and jump to the first step that has a problem, when the server sends back an error.
  useEffect(() => {
    if (values?.type) setType(values.type);
    if (err) setStep(err.type ? 1 : err.details ? 2 : 3);
  }, [values, err]);

  // After each step change, move focus to the new step's heading so screen readers announce it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.getElementById(`${uid}-step-${step}`)?.focus();
  }, [step, uid]);

  useEffect(() => {
    if (state.status === "ok") successRef.current?.focus();
  }, [state.status]);

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
    const rows: Array<[string, string]> = sent
      ? ([
          ["You asked for", sent.typeLabel],
          sent.size ? ["Drawer size", sent.size] : null,
          sent.quantity ? ["How many", sent.quantity] : null,
          sent.photos ? ["Photos", `${sent.photos} attached`] : null,
          ["City", sent.city],
          ["We will contact", sent.phone],
        ] as Array<[string, string] | null>).filter((r): r is [string, string] => !!r)
      : [];
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="my-auto outline-none">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-pill bg-moss-tint text-moss">
            <Check className="size-7" />
          </span>
          <div>
            <h2 className="t-h2 text-ink">Request received</h2>
            <p className="mt-1 t-body text-graphite">We will reply with a quote by phone or WhatsApp.</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 rounded-card bg-mist p-4 md:p-5">
          <div>
            <p className="t-caption text-graphite">Request number</p>
            <p className="mt-1 font-heading text-[28px] font-semibold leading-8 tracking-tight text-ink [font-variant-numeric:tabular-nums]">{state.id}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(state.id).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-ctl border border-line bg-surface px-4 t-label text-ink hover:border-graphite/50"
          >
            {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {rows.length > 0 && (
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 py-3">
                <dt className="t-small text-graphite">{k}</dt>
                <dd className="text-right t-value text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className="mt-6 flex gap-3 t-small text-graphite">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-moss" aria-hidden="true" />
          You pay nothing until you approve the quote. Mention this number if you message us.
        </p>

        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <WhatsAppButton
            number={whatsappNumber}
            message={`Hi Yatsar 3D, I just sent custom order request ${state.id}. I'm messaging so you have my WhatsApp.`}
            label="Message us on WhatsApp"
            block={false}
          />
          <button type="button" onClick={onReset} className="inline-flex min-h-11 items-center px-2 t-label text-ink underline underline-offset-[3px]">
            Send another request
          </button>
        </div>
      </div>
    );
  }

  const here = missing.filter((k) => stepOf[k] === step);
  const canContinue = here.length === 0;
  const meta = steps[step - 1];

  return (
    <form
      ref={formRef}
      onInput={check}
      noValidate
      // Enter in a text box moves forward instead of sending the form early.
      onKeyDown={(e) => {
        if (e.key === "Enter" && step < 3 && (e.target as HTMLElement).tagName === "INPUT") {
          e.preventDefault();
          if (canContinue) setStep((s) => (s + 1) as 1 | 2 | 3);
        }
      }}
      action={(fd) => {
        setSent({
          typeLabel: typeLabel ?? "",
          size: type === "drawers" && dims.l && dims.w && dims.d ? `${dims.l} × ${dims.w} × ${dims.d} mm` : undefined,
          quantity: String(fd.get("quantity") ?? "").trim() || undefined,
          photos: photos.length,
          city: String(fd.get("city") ?? "").trim(),
          phone: String(fd.get("phone") ?? "").trim(),
        });
        fd.delete("photos");
        photos.forEach((p) => fd.append("photos", p.file));
        // The three drawer boxes become one line of text, and a company name joins the details.
        if (type === "drawers" && dims.l && dims.w && dims.d) fd.set("size", `${dims.l} x ${dims.w} x ${dims.d} mm (length x width x depth)`);
        if (type === "business" && company.trim()) fd.set("details", `Company: ${company.trim()}\n\n${String(fd.get("details") ?? "")}`);
        action(fd);
      }}
    >
      {/* Hidden trap field for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Progress step={step} />

      <h2 id={`${uid}-step-${step}`} tabIndex={-1} className="mt-8 t-h2 text-ink outline-none">
        {meta.title}
      </h2>
      <p className="mt-2 t-body text-graphite">{meta.help}</p>

      {/* Every step stays in the page, hidden, so nothing typed is lost when you go back. */}
      <div hidden={step !== 1} className="mt-6">
        <fieldset>
          <legend className="sr-only">What do you need?</legend>
          <div className="grid gap-3 sm:grid-cols-3" role="radiogroup">
            {REQUEST_TYPES.map((t) => {
              const Icon = typeIcons[t.key];
              const selected = type === t.key;
              return (
                <label
                  key={t.key}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-4 rounded-card border-2 p-4 transition-colors duration-150 sm:flex-col sm:items-start sm:gap-5 sm:p-5",
                    selected ? "border-ink bg-mist" : "border-line hover:border-graphite/40",
                  )}
                >
                  <input type="radio" name="type" value={t.key} checked={selected} onChange={() => setType(t.key)} className="sr-only" />
                  <span aria-hidden="true" className={cn("grid size-12 shrink-0 place-items-center rounded-pill", typeCopy[t.key].tint)}>
                    <Icon className="size-6" />
                  </span>
                  <span>
                    <span className="block t-label text-ink">{t.label}</span>
                    <span className="mt-1 block t-small text-graphite">{typeCopy[t.key].short}</span>
                  </span>
                  {selected && (
                    <span aria-hidden="true" className="absolute right-3 top-3 grid size-6 place-items-center rounded-pill bg-ink text-surface">
                      <Check className="size-4" />
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div hidden={step !== 2} className="mt-6 space-y-5">
        {copy && (
          <>
            <p className="inline-flex items-center gap-2 rounded-pill bg-mist py-1 pl-1 pr-3 t-small text-ink">
              <span aria-hidden="true" className={cn("grid size-6 place-items-center rounded-pill", copy.tint)}>
                {type && (() => { const I = typeIcons[type]; return <I className="size-3.5" />; })()}
              </span>
              {typeLabel}
            </p>

            {type === "drawers" && (
              <fieldset>
                <legend className="mb-2 t-label text-ink">Inside size of the drawer, in mm</legend>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    ["l", "Length"],
                    ["w", "Width"],
                    ["d", "Depth"],
                  ] as const).map(([k, label]) => (
                    <div key={k}>
                      <label htmlFor={`${uid}-dim-${k}`} className="mb-2 block t-small text-graphite">
                        {label}
                      </label>
                      <input
                        id={`${uid}-dim-${k}`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={dims[k]}
                        onChange={(e) => setDims((cur) => ({ ...cur, [k]: e.target.value.replace(/\D/g, "") }))}
                        placeholder="mm"
                        className={input}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-2 t-small text-graphite">Measure the empty space inside, from wall to wall.</p>
              </fieldset>
            )}

            {type === "business" && (
              <Field id={`${uid}-company`} label="Company name" optional>
                <input id={`${uid}-company`} value={company} maxLength={80} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" className={input} />
              </Field>
            )}

            <Field id={`${uid}-details`} label={copy.detailsLabel} error={err?.details}>
              <textarea
                id={`${uid}-details`}
                name="details"
                rows={4}
                defaultValue={values?.details}
                placeholder={copy.placeholder}
                aria-invalid={!!err?.details}
                aria-describedby={err?.details ? `${uid}-details-error` : undefined}
                className={cn(input, "h-auto min-h-28 py-3")}
              />
            </Field>

            <Field id={`${uid}-qty`} label="How many" optional>
              <input id={`${uid}-qty`} name="quantity" inputMode="numeric" defaultValue={values?.quantity} className={cn(input, "sm:max-w-[200px]")} />
            </Field>

            <div>
              <p className="mb-2 t-label text-ink">
                Photos or a sketch <span className="font-normal text-graphite">(optional)</span>
              </p>
              {photos.length > 0 && (
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
              )}
              {photos.length < MAX_PHOTOS && (
                <>
                  <input ref={fileInput} id={`${uid}-photos`} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => void addPhotos(e.target.files)} />
                  <label
                    htmlFor={`${uid}-photos`}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-ctl border border-line px-4 t-label text-ink hover:border-graphite/50"
                  >
                    <Camera className="size-[18px]" aria-hidden="true" />
                    Add photos
                  </label>
                </>
              )}
              <p className="mt-2 t-small text-graphite" role={photoNote ? "alert" : undefined}>
                {photoNote ?? `Up to ${MAX_PHOTOS}. They are made smaller on your phone before sending.`}
              </p>
            </div>
          </>
        )}
      </div>

      <div hidden={step !== 3} className="mt-6 space-y-5">
        {typeLabel && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-card bg-mist p-4 t-small text-ink">
            <span className="t-label">Your request</span>
            <span className="text-graphite">
              {typeLabel}
              {type === "drawers" && dims.l && dims.w && dims.d ? `, ${dims.l} × ${dims.w} × ${dims.d} mm` : ""}
              {photos.length ? `, ${photos.length} ${photos.length === 1 ? "photo" : "photos"}` : ""}
            </span>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="ml-auto inline-flex min-h-11 items-center gap-1.5 t-label text-ink underline underline-offset-[3px]"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit
            </button>
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={`${uid}-name`} label="Your name" error={err?.name}>
            <input id={`${uid}-name`} name="name" autoComplete="name" defaultValue={values?.name} aria-invalid={!!err?.name} aria-describedby={err?.name ? `${uid}-name-error` : undefined} className={input} />
          </Field>
          <Field id={`${uid}-phone`} label="Phone or WhatsApp" error={err?.phone}>
            <input id={`${uid}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={values?.phone} aria-invalid={!!err?.phone} aria-describedby={err?.phone ? `${uid}-phone-error` : undefined} className={input} />
          </Field>
          <Field id={`${uid}-city`} label="City" error={err?.city}>
            <input id={`${uid}-city`} name="city" autoComplete="address-level2" defaultValue={values?.city} aria-invalid={!!err?.city} aria-describedby={err?.city ? `${uid}-city-error` : undefined} className={input} />
          </Field>
          <Field id={`${uid}-email`} label="Email" optional error={err?.email}>
            <input id={`${uid}-email`} name="email" type="email" inputMode="email" autoComplete="email" defaultValue={values?.email} aria-invalid={!!err?.email} aria-describedby={err?.email ? `${uid}-email-error` : undefined} className={input} />
          </Field>
        </div>
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p role="alert" className="mt-6 rounded-ctl bg-error-tint px-3 py-2 t-small text-error">
          {state.message}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
            className="inline-flex min-h-11 items-center gap-2 rounded-ctl px-2 t-label text-ink hover:bg-mist"
          >
            <ArrowLeft className="size-[18px]" aria-hidden="true" />
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <Button type="button" disabled={!canContinue} onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)} icon={<ArrowRight className="size-5" aria-hidden="true" />} className="min-w-[160px]">
            Continue
          </Button>
        ) : (
          <Button type="submit" loading={pending} disabled={!canContinue} icon={<Send className="size-[18px]" aria-hidden="true" />} className="min-w-[180px]">
            Send request
          </Button>
        )}
      </div>
      <p aria-live="polite" className="mt-3 text-right t-small text-graphite">
        {!canContinue
          ? `To continue, add ${here.map((k) => missingLabels[k] ?? k).join(", ")}.`
          : step === 3
            ? "We use these details only to reply to your request. No payment is taken here."
            : ""}
      </p>
    </form>
  );
}
