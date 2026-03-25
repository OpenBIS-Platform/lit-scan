import { store } from './store.js';
import { installPatches, removePatches } from './patch/index.js';
import { initOverlay, teardownOverlay, drawOverlay } from './overlay/index.js';
import { initPanel, teardownPanel } from './panel/index.js';
import { initBridge } from './bridge.js';
let isScanning = false;
export function scan(options) {
    if (isScanning)
        return;
    isScanning = true;
    if (options?.logPrefix) {
        console.log(`${options.logPrefix} Starting lit-scan...`);
    }
    // Hook DevTools incoming messages natively
    window.addEventListener('message', handleDevToolsMessage);
    initOverlay();
    initPanel();
    initBridge();
    installPatches(options);
    console.log('[lit-scan] Scanning started');
}
const handleDevToolsMessage = (event) => {
    if (event.data?.source !== 'lit-scan-devtools')
        return;
    if (event.data?.payload?.type === 'HIGHLIGHT_INSTANCE') {
        const id = event.data.payload.id;
        const ref = store.idMap.get(id);
        const element = ref?.deref();
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            drawOverlay(element); // Re-draw the overlay to highlight it!
        }
    }
};
export function stopScan() {
    if (!isScanning)
        return;
    isScanning = false;
    window.removeEventListener('message', handleDevToolsMessage);
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