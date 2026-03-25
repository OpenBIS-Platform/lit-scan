import { ReactiveElement } from 'lit';
import { store } from '../store.js';
import { drawOverlay } from '../overlay/index.js';
import { emitUpdateData } from '../bridge.js';
import type { LitScanOptions } from '../types.js';

let originalRequestUpdate: any;
let originalPerformUpdate: any;
let originalUpdated: any;

const updateStartTimes = new WeakMap<ReactiveElement, number>();
const updateStack: ReactiveElement[] = [];
const causalityMap = new WeakMap<ReactiveElement, ReactiveElement | null>();

export function installPatches(_options?: LitScanOptions) {
  const proto = ReactiveElement.prototype as any;
  
  // Save originals if we haven't yet
  if (!originalRequestUpdate) {
    originalRequestUpdate = proto.requestUpdate;
    originalPerformUpdate = proto.performUpdate;
    originalUpdated = proto.updated;
  }

  proto.requestUpdate = function (name?: PropertyKey, oldValue?: unknown, options?: any) {
    if (updateStack.length > 0) {
        const caller = updateStack[updateStack.length - 1];
        if (caller !== this) {
            causalityMap.set(this, caller);
        }
    }
    return originalRequestUpdate.call(this, name, oldValue, options);
  };

  proto.performUpdate = function () {
    updateStartTimes.set(this, performance.now());
    updateStack.push(this);
    try {
        return originalPerformUpdate.call(this);
    } finally {
        updateStack.pop();
    }
  };

  proto.updated = function (changedProperties: Map<PropertyKey, unknown>) {
    const startTime = updateStartTimes.get(this);
    const duration = startTime ? performance.now() - startTime : 0;
    
    // We want to capture PropertyKey -> { oldValue, newValue }
    const fullChangedProps = new Map<PropertyKey, { oldValue: unknown, newValue: unknown }>();
    changedProperties.forEach((oldValue, key) => {
        fullChangedProps.set(key, { oldValue, newValue: (this as any)[key as string] });
    });

    const causedBy = causalityMap.get(this);
    if (causedBy) {
        causalityMap.delete(this);
    }

    // Record it in our central store
    store.recordUpdate(this, duration, fullChangedProps, causedBy);

    // Call user's/element's original `updated`
    originalUpdated.call(this, changedProperties);
    
    // Heuristic: If it has 0 changed properties and isn't the first render, 
    // and causedBy is empty, it's likely a Signal or forced update. 
    // We can tag the payload specifically if it has a '_watcher' field (from @lit-labs/signals)
    if (changedProperties.size === 0 && (this as any).hasUpdated && (this as any)._watcher) {
        fullChangedProps.set('Signal Triggered', { oldValue: '?', newValue: 'changed' });
    }
    
    // Trigger visual overlay update
    drawOverlay(this);
    
    // Broadcast to DevTools extension bridge
    emitUpdateData(this.tagName.toLowerCase(), store.getInstanceData(this).count, duration, fullChangedProps, causedBy?.tagName.toLowerCase());
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
