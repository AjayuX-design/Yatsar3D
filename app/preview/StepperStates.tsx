"use client";

import { useState } from "react";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Demo } from "./parts";

const noop = () => {};

export function StepperStates() {
  const [live, setLive] = useState(2);
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
      <Demo label="Interactive (max 5)">
        <QuantityStepper value={live} onChange={setLive} max={5} />
      </Demo>
      <Demo label="Minimum (1)">
        <QuantityStepper value={1} onChange={noop} />
      </Demo>
      <Demo label="Maximum reached">
        <QuantityStepper value={3} onChange={noop} max={3} />
      </Demo>
      <Demo label="Loading">
        <QuantityStepper value={2} onChange={noop} loading />
      </Demo>
      <Demo label="Two digits, tabular">
        <QuantityStepper value={12} onChange={noop} />
      </Demo>
    </div>
  );
}
