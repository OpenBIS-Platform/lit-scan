import { LitScanOptions } from './types.js';
export declare function scan(options?: LitScanOptions): void;
export declare function stopScan(): void;
export declare function getStore(): {
    data: import("./types.js").LitScanStoreData;
    nextInstanceId: number;
    idMap: Map<number, WeakRef<import("lit").ReactiveElement>>;
    getData(): import("./types.js").LitScanStoreData;
    getInstanceData(instance: import("lit").ReactiveElement): import("./types.js").InstanceUpdateData;
    recordUpdate(instance: import("lit").ReactiveElement, duration: number, changedProps: Map<PropertyKey, {
        oldValue: unknown;
        newValue: unknown;
    }>, causedBy?: import("lit").ReactiveElement | null): void;
    clear(): void;
};
export * from './types.js';
//# sourceMappingURL=index.d.ts.map