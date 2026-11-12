"use client";

import { VariantPill } from "@/components/product/VariantSelector";
import { swatchFor } from "@/lib/product/swatch";
import { Demo } from "./parts";

const noop = () => {};

export function PillStates() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
      <Demo label="Default">
        <VariantPill name="Type" label="Standard" selected={false} onSelect={noop} />
      </Demo>
      <Demo label="Selected">
        <VariantPill name="Type" label="Tougher" selected onSelect={noop} />
      </Demo>
      <Demo label="Unavailable">
        <VariantPill name="Size" label="Large" selected={false} available={false} onSelect={noop} />
      </Demo>
      {["Beige", "Pink", "Orange", "Red", "White", "Yellow", "Matte Black", "Teal"].map((c, i) => (
        <Demo key={c} label={`Colour: ${c}`}>
          <VariantPill name="Color" label={c} selected={i === 2} available={c !== "Yellow"} swatch={swatchFor(c)} onSelect={noop} />
        </Demo>
      ))}
      <Demo label="With price difference">
        <VariantPill name="Size" label="Medium" selected={false} delta={300} onSelect={noop} />
      </Demo>
    </div>
  );
}
