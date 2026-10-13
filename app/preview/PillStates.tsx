"use client";

import { VariantPill } from "@/components/product/VariantSelector";
import { Demo } from "./parts";

const noop = () => {};

export function PillStates() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
      <Demo label="Default">
        <VariantPill name="Material" label="PLA" selected={false} onSelect={noop} />
      </Demo>
      <Demo label="Selected">
        <VariantPill name="Material" label="PETG" selected onSelect={noop} />
      </Demo>
      <Demo label="Unavailable">
        <VariantPill name="Size" label="Large" selected={false} available={false} onSelect={noop} />
      </Demo>
      <Demo label="With price difference">
        <VariantPill name="Size" label="Medium" selected={false} delta={300} onSelect={noop} />
      </Demo>
    </div>
  );
}
