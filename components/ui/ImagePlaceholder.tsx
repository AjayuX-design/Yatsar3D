import Image from "next/image";
import { cn } from "@/lib/cn";

// Fine horizontal lines, like the layers of a print. Used only as the fallback
// when a product has no photo yet.
const layerLines = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, transparent 0 7px, rgb(23 23 23 / 0.045) 7px 8px)",
};

/**
 * Fills its parent (give the parent a position and an aspect ratio).
 * With a src it shows the photo. Without one it shows a quiet layer-line
 * texture with a short caption, so a missing photo looks intended.
 */
export function ImagePlaceholder({
  src,
  alt,
  label,
  sizes = "(min-width: 1024px) 600px, 100vw",
  priority = false,
  className,
}: {
  src?: string;
  alt: string;
  label: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        // SVG mock images do not go through the image optimiser.
        unoptimized={src.endsWith(".svg")}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${alt} (photo not added yet)`}
      className={cn("absolute inset-0 bg-mist", className)}
      style={layerLines}
    >
      {label && (
        <span className="absolute inset-x-0 bottom-4 text-center t-caption text-graphite/80">{label}</span>
      )}
    </div>
  );
}
