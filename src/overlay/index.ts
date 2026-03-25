import type { ReactiveElement } from 'lit';
import { store } from '../store.js';

let overlayContainer: HTMLElement | null = null;
const activeBoxes = new WeakMap<ReactiveElement, HTMLElement>();

export function initOverlay() {
  if (overlayContainer) return;
  overlayContainer = document.createElement('div');
  overlayContainer.id = 'lit-scan-overlay';
  overlayContainer.style.position = 'fixed';
  overlayContainer.style.top = '0';
  overlayContainer.style.left = '0';
  overlayContainer.style.width = '100vw';
  overlayContainer.style.height = '100vh';
  overlayContainer.style.pointerEvents = 'none';
  overlayContainer.style.zIndex = '2147483647'; // max z-index
  overlayContainer.style.overflow = 'hidden';
  document.body.appendChild(overlayContainer);
}

export function teardownOverlay() {
  if (overlayContainer) {
    overlayContainer.remove();
    overlayContainer = null;
  }
}

export function drawOverlay(instance: ReactiveElement) {
  if (!overlayContainer) return;

  const data = store.getInstanceData(instance);
  
  const rect = instance.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0 || rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth) {
     return; // Not visible
  }

  let box = activeBoxes.get(instance);
  if (!box) {
    box = document.createElement('div');
    box.style.position = 'absolute';
    // Heatmap style coloring based on count would be nice, but stick to red for simplicity per requirements
    box.style.border = '1px solid rgba(255, 60, 60, 0.9)';
    box.style.backgroundColor = 'rgba(255, 60, 60, 0.15)';
    box.style.boxSizing = 'border-box';
    box.style.transition = 'opacity 0.6s ease-in-out';
    box.style.display = 'flex';
    box.style.alignItems = 'flex-start';
    box.style.justifyContent = 'flex-start';
    box.style.overflow = 'visible';
    
    const label = document.createElement('div');
    label.style.backgroundColor = 'rgba(255, 60, 60, 0.9)';
    label.style.color = '#fff';
    label.style.fontSize = '9px';
    label.style.fontFamily = 'monospace';
    label.style.padding = '2px 4px';
    label.style.borderRadius = '2px';
    label.style.whiteSpace = 'nowrap';
    label.style.transform = 'translateY(-100%)';
    label.style.pointerEvents = 'none';
    label.className = 'lit-scan-label';
    
    box.appendChild(label);
    overlayContainer.appendChild(box);
    activeBoxes.set(instance, box);
  }

  // Reset styles for animation
  box.style.opacity = '1';
  
  // Update position
  box.style.top = `${rect.top}px`;
  box.style.left = `${rect.left}px`;
  box.style.width = `${rect.width}px`;
  box.style.height = `${rect.height}px`;

  // Update label
  const label = box.querySelector('.lit-scan-label') as HTMLDivElement;
  if (label) {
    const lastDurationMs = data.durations[data.durations.length - 1] ?? 0;
    label.textContent = `${data.tag} | ${data.count}x | ${lastDurationMs.toFixed(1)}ms`;
  }

  // Clear previous timeout and set a new one to fade out and remove
  clearTimeout((box as any)._timeout);
  (box as any)._timeout = setTimeout(() => {
    if (box) {
        box.style.opacity = '0';
        // Remove from DOM after transition
        (box as any)._removeTimeout = setTimeout(() => {
            if (box && box.parentElement) {
                box.parentElement.removeChild(box);
                activeBoxes.delete(instance);
            }
        }, 600); // Wait for transition
    }
  }, 200) as any;
}
