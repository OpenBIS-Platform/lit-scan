import { store } from './store.js';
import { installPatches, removePatches } from './patch/index.js';
import { initOverlay, teardownOverlay } from './overlay/index.js';
import { initPanel, teardownPanel } from './panel/index.js';
import { initBridge } from './bridge.js';
let isScanning = false;
export function scan(options) {
    if (isScanning)
        return;
    isScanning = true;
    initBridge();
    initOverlay();
    initPanel();
    installPatches(options);
    console.log('[lit-scan] Scanning started');
}
export function stopScan() {
    if (!isScanning)
        return;
    isScanning = false;
    removePatches();
    teardownOverlay();
    teardownPanel();
    store.clear();
    console.log('[lit-scan] Scanning stopped');
}
export function getStore() {
    return store;
}
export * from './types.js';
//# sourceMappingURL=index.js.map