import { LitScanOptions } from './types.js';
import { store } from './store.js';
import { installPatches, removePatches } from './patch/index.js';
import { initOverlay, teardownOverlay } from './overlay/index.js';
import { initPanel, teardownPanel } from './panel/index.js';

let isScanning = false;

export function scan(options?: LitScanOptions) {
  if (isScanning) return;
  isScanning = true;
  initOverlay();
  initPanel();
  installPatches(options);
  console.log('[lit-scan] Scanning started');
}

export function stopScan() {
  if (!isScanning) return;
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
