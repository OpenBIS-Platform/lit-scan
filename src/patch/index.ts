import { ReactiveElement } from 'lit';
import { store } from '../store.js';
import { drawOverlay } from '../overlay/index.js';
import type { LitScanOptions } from '../types.js';

let originalRequestUpdate: any;
let originalPerformUpdate: any;
let originalUpdated: any;

const updateStartTimes = new WeakMap<ReactiveElement, number>();

export function installPatches(_options?: LitScanOptions) {
  const proto = ReactiveElement.prototype as any;
  
  // Save originals if we haven't yet
  if (!originalRequestUpdate) {
    originalRequestUpdate = proto.requestUpdate;
    originalPerformUpdate = proto.performUpdate;
    originalUpdated = proto.updated;
  }

  proto.requestUpdate = function (name?: PropertyKey, oldValue?: unknown, options?: any) {
    // We could capture triggered updates here, but we focus on actual perf issues first
    return originalRequestUpdate.call(this, name, oldValue, options);
  };

  proto.performUpdate = function () {
    updateStartTimes.set(this, performance.now());
    return originalPerformUpdate.call(this);
  };

  proto.updated = function (changedProperties: Map<PropertyKey, unknown>) {
    const startTime = updateStartTimes.get(this);
    const duration = startTime ? performance.now() - startTime : 0;
    
    // We want to capture PropertyKey -> { oldValue, newValue }
    const fullChangedProps = new Map<PropertyKey, { oldValue: unknown, newValue: unknown }>();
    changedProperties.forEach((oldValue, key) => {
        fullChangedProps.set(key, { oldValue, newValue: (this as any)[key as string] });
    });

    // Record it in our central store
    store.recordUpdate(this, duration, fullChangedProps);

    // Call user's/element's original `updated`
    originalUpdated.call(this, changedProperties);
    
    // Trigger visual overlay update
    drawOverlay(this);
  };
}

export function removePatches() {
  const proto = ReactiveElement.prototype as any;
  if (originalRequestUpdate) {
      proto.requestUpdate = originalRequestUpdate;
      proto.performUpdate = originalPerformUpdate;
      proto.updated = originalUpdated;
  }
}
