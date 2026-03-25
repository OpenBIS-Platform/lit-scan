import { LitScanStoreData, InstanceUpdateData } from './types.js';
import type { ReactiveElement } from 'lit';
declare class Store {
    data: LitScanStoreData;
    /**
     * Get the underlying store data
     */
    getData(): LitScanStoreData;
    /**
     * Get or initialize tracking data for a specific instance
     */
    getInstanceData(instance: ReactiveElement): InstanceUpdateData;
    /**
     * Record a completed update for a component
     */
    recordUpdate(instance: ReactiveElement, duration: number, changedProps: Map<PropertyKey, {
        oldValue: unknown;
        newValue: unknown;
    }>, causedBy?: ReactiveElement | null): void;
    /**
     * Clear the complete state explicitly (if scanning is stopped and cleared)
     */
    clear(): void;
}
export declare const store: Store;
export {};
//# sourceMappingURL=store.d.ts.map