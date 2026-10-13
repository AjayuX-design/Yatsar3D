import Link from "next/link";
import { cn } from "@/lib/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Yatsar 3D, home"
      className={cn("inline-flex min-h-11 items-center font-heading text-[22px] font-bold leading-none tracking-tight text-ink", className)}
    >
      Yatsar <span className="ml-1 text-kiln">3D</span>
    </Link>
  );
}
