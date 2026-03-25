import { LitScanStoreData, InstanceUpdateData } from './types.js';
import type { ReactiveElement } from 'lit';

class Store {
  public data: LitScanStoreData = {
    instances: new WeakMap(),
    recentUpdates: [],
    hotComponents: new Map(),
  };

  /**
   * Get the underlying store data
   */
  getData(): LitScanStoreData {
    return this.data;
  }

  /**
   * Get or initialize tracking data for a specific instance
   */
  getInstanceData(instance: ReactiveElement): InstanceUpdateData {
    let data = this.data.instances.get(instance);
    if (!data) {
      data = {
        tag: instance.tagName.toLowerCase(),
        count: 0,
        durations: [],
        latestChangedProperties: new Map(),
        lastUpdated: 0,
      };
      this.data.instances.set(instance, data);
    }
    return data;
  }

  /**
   * Record a completed update for a component
   */
  recordUpdate(
    instance: ReactiveElement,
    duration: number,
    changedProps: Map<PropertyKey, { oldValue: unknown; newValue: unknown }>,
    causedBy?: ReactiveElement | null
  ) {
    const data = this.getInstanceData(instance);
    const now = performance.now();
    
    // Update instance stats
    data.count++;
    data.durations.push(duration);
    if (data.durations.length > 50) {
      data.durations.shift(); // keep it bounded
    }
    data.latestChangedProperties = changedProps;
    data.lastUpdated = now;

    // Update global hot components
    const tag = data.tag;
    const currentHotCount = this.data.hotComponents.get(tag) ?? 0;
    this.data.hotComponents.set(tag, currentHotCount + 1);

    // Update recent queue
    this.data.recentUpdates.push({
      element: new WeakRef(instance),
      tag,
      timestamp: now,
      duration,
      causedBy: causedBy ? new WeakRef(causedBy) : null,
    });
    
    // Keep recent updates history bounded
    if (this.data.recentUpdates.length > 100) {
      this.data.recentUpdates.shift();
    }
  }

  /**
   * Clear the complete state explicitly (if scanning is stopped and cleared)
   */
  clear() {
    this.data = {
      instances: new WeakMap(),
      recentUpdates: [],
      hotComponents: new Map(),
    };
  }
}

// Singleton export
export const store = new Store();
