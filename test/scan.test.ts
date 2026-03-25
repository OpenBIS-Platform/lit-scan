import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { scan, stopScan, getStore } from '../src/index.js';

@customElement('test-element')
class TestElement extends LitElement {
    @property({ type: String }) text = 'initial';
    
    render() {
        return html`<div>${this.text}</div>`;
    }
}

describe('lit-scan functionality', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        scan(); // Start lit-scan
    });

    afterEach(() => {
        stopScan(); // Stops and clears store
        container.remove();
    });

    it('should detect a component update and record it in the store', async () => {
        const el = document.createElement('test-element') as TestElement;
        container.appendChild(el);
        
        // Wait for first update
        await el.updateComplete;
        
        const store = getStore().getData();
        const instanceData = store.instances.get(el);
        
        expect(instanceData).toBeDefined();
        // First render counts as 1 update
        expect(instanceData?.count).toBe(1);
        expect(instanceData?.tag).toBe('test-element');
        expect(instanceData?.durations.length).toBe(1);
    });

    it('should accurately capture updated properties', async () => {
        const el = document.createElement('test-element') as TestElement;
        container.appendChild(el);
        
        await el.updateComplete;
        
        // Trigger a property update
        el.text = 'updated text';
        await el.updateComplete;
        
        const store = getStore().getData();
        const instanceData = store.instances.get(el);
        
        // Should be 2 updates (initial + new)
        expect(instanceData?.count).toBe(2);
        
        // Check changed properties for the latest update
        const changedProps = instanceData?.latestChangedProperties;
        expect(changedProps?.has('text')).toBe(true);
        expect(changedProps?.get('text')).toEqual({
            oldValue: 'initial',
            newValue: 'updated text'
        });
    });

    it('should correctly increment hot components counter', async () => {
        const el1 = document.createElement('test-element') as TestElement;
        const el2 = document.createElement('test-element') as TestElement;
        
        container.appendChild(el1);
        container.appendChild(el2);
        
        await el1.updateComplete;
        await el2.updateComplete;
        
        // Both update again
        el1.requestUpdate();
        el2.requestUpdate();
        await el1.updateComplete;
        await el2.updateComplete;
        
        const store = getStore().getData();
        
        // 2 elements * 2 updates = 4 total updates for test-element
        expect(store.hotComponents.get('test-element')).toBe(4);
    });
});
