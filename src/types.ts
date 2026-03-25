import type { ReactiveElement, PropertyValues } from 'lit';

export interface LitScanOptions {
  /**
   * Optional prefix for console logging
   */
  logPrefix?: string;
  // Expand with further options as needed
}

export interface InstanceUpdateData {
  /**
   * A unique identifier for the instance, assigned by LitScan.
   */
  id: number;
  /**
   * The tag name of the component
   */
  tag: string;
  /**
   * The total numbers of completed updates
   */
  count: number;
  /**
   * Durations of the most recent updates (in ms)
   */
  durations: number[];
  /**
   * The changed properties from the most recent update
   */
  latestChangedProperties: Map<PropertyKey, { oldValue: unknown, newValue: unknown }>;
  /**
   * Timestamp of the last update
   */
  lastUpdated: number;
}

export interface LitScanStoreData {
  /**
   * Track update counts and details per reactive element instance.
   * WeakMap ensures we don't leak references to DOM elements when they are unmounted.
   */
  instances: WeakMap<ReactiveElement, InstanceUpdateData>;
  
  /**
   * Aggregated list of recent updates across all tracked elements.
   * Contains weak references to avoid leaks.
   */
  recentUpdates: Array<{
    element: WeakRef<ReactiveElement>;
    tag: string;
    timestamp: number;
    duration: number;
    causedBy?: WeakRef<ReactiveElement> | null;
  }>;
  
  /**
   * Aggregate counters for "hot components" (e.g. `tag-name` -> `total update count`)
   */
  hotComponents: Map<string, number>;
}
