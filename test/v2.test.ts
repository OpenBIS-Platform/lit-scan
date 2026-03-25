import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { scan, stopScan, getStore } from '../src/index.js';

@customElement('v2-child')
class V2Child extends LitElement {
    @property({ type: Number }) val = 0;
    render() { return html`<span>${this.val}</span>`; }
}

@customElement('v2-parent')
class V2Parent extends LitElement {
    @property({ type: Number }) val = 0;
    render() { return html`<v2-child .val=${this.val}></v2-child>`; }
}

describe('lit-scan v2 functionality', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        scan(); // Start lit-scan
    });

    afterEach(() => {
        stopScan(); // Stops and clears store
        container.remove();
        vi.restoreAllMocks();
    });

    it('should correctly determine parent-child causality in cascade tracking', async () => {
        const parent = document.createElement('v2-parent') as V2Parent;
        container.appendChild(parent);

        // Wait for first render cascade
        await parent.updateComplete;
        const child = parent.shadowRoot?.querySelector('v2-child') as V2Child;
        await child.updateComplete;

        const store = getStore().getData();
        
        // Trigger a new cascade
        parent.val = 42;
        await parent.updateComplete;
        await child.updateComplete;

        // The recentUpdates array should show the child update being caused by the parent
        const recent = store.recentUpdates;
        expect(recent.length).toBeGreaterThan(0);
        
        // Find the latest child update
        const childUpdate = recent.reverse().find(u => u.tag === 'v2-child');
        expect(childUpdate).toBeDefined();
        
        // The child update should have been caused by the parent
        const causer = childUpdate?.causedBy?.deref();
        expect(causer).toBeDefined();
        expect(causer?.tagName.toLowerCase()).toBe('v2-parent');
    });

    it('should emit window.postMessage events for the DevTools bridge', async () => {
        const postMessageSpy = vi.spyOn(window, 'postMessage');
        
        const el = document.createElement('v2-parent') as V2Parent;
        container.appendChild(el);
        await el.updateComplete;

        // Ensure postMessage was called by emitUpdateData
        const updateCalls = postMessageSpy.mock.calls.filter(call => 
            call[0] && call[0].source === 'lit-scan-runtime' && call[0].payload.type === 'COMPONENT_UPDATE'
        );
        
        expect(updateCalls.length).toBeGreaterThan(0);
        
        // Check payload structure
        const lastPayload = updateCalls[updateCalls.length - 1][0].payload.data;
        expect(lastPayload.tag).toBeDefined();
        expect(lastPayload.count).toBeDefined();
        expect(lastPayload.duration).toBeDefined();
        expect(lastPayload.changedProps).toBeDefined();
    });
});
