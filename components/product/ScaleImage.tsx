import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { ProductImage } from "@/lib/types";

/** Real-world size shot with a short caption. Hides when the product has none. */
export function ScaleImage({ image, caption }: { image?: ProductImage; caption?: string }) {
  if (!image) return null;
  return (
    <figure>
      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-mist sm:aspect-[4/3]">
        <ImagePlaceholder src={image.src} alt={image.alt} label="Photo coming soon" />
      </div>
      {caption && <figcaption className="mt-3 t-small text-graphite">{caption}</figcaption>}
    </figure>
  );
}
