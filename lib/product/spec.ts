import { formatDimensions } from "../format/dimensions";
import type { Product, ProductVariant } from "../types";

export type SpecRow = { label: string; value: string; sub?: string };

/** Variant values win over product values. Rows with no data are left out. */
export function buildSpecRows(product: Product, variant?: ProductVariant): SpecRow[] {
  const dims = formatDimensions(variant?.dimensions ?? product.dimensions);
  const weight = variant?.weightG ?? product.weightG;
  const rows: Array<SpecRow | null> = [
    dims ? { label: "Dimensions", value: dims.mm, sub: dims.cm } : null,
    weight ? { label: "Weight", value: `${weight} g` } : null,
    product.material ? { label: "Material", value: product.material } : null,
    product.finish ? { label: "Finish", value: product.finish } : null,
    product.colour ? { label: "Colour", value: product.colour } : null,
  ];
  return rows.filter((r): r is SpecRow => r !== null);
}
