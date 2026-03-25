/// <reference types="chrome" />
import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('lit-scan-panel-app')
export class LitScanPanelApp extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 16px;
            height: 100vh;
            box-sizing: border-box;
            overflow-y: auto;
        }
        h2 { color: #ff5555; margin-top: 0; }
        .log {
            font-family: monospace;
            background: #111;
            padding: 8px;
            margin-bottom: 4px;
            border-radius: 4px;
            border-left: 3px solid #ff5555;
            display: flex;
            justify-content: space-between;
        }
        .props {
            font-size: 10px;
            color: #888;
        }
    `;

    @state()
    updates: any[] = [];

    @state()
    filterText = '';

    private port: chrome.runtime.Port | null = null;

    connectedCallback() {
        super.connectedCallback();
        this.setupConnection();
    }

    setupConnection() {
        // Connect to background script
        this.port = chrome.runtime.connect({ name: 'lit-scan-panel' });
        
        // Register current inspected tab
        this.port.postMessage({
            action: 'init',
            tabId: chrome.devtools.inspectedWindow.tabId
        });

        this.port.onMessage.addListener((msg) => {
            if (msg.type === 'COMPONENT_UPDATE') {
                this.updates = [msg.data, ...this.updates].slice(0, 50); // Keep last 50
            } else if (msg.type === 'INIT_STORE') {
                this.updates = []; // reset on page load
            }
        });
    }

    highlightComponent(id: number) {
        if (this.port) {
            this.port.postMessage({ 
                type: 'HIGHLIGHT_INSTANCE', 
                id, 
                tabId: chrome.devtools?.inspectedWindow?.tabId 
            });
        }
    }

    render() {
        const visibleUpdates = this.updates.filter(u => u.tag.toLowerCase().includes(this.filterText.toLowerCase()));

        return html`
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h2>🔥 lit-scan DevTools</h2>
                <button @click=${() => this.updates = []} style="background: #444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">Clear Logs</button>
            </div>
            
            <input 
                type="text" 
                placeholder="Filter by component tag..." 
                .value=${this.filterText}
                @input=${(e: any) => this.filterText = e.target.value}
                style="width: 100%; padding: 8px; box-sizing: border-box; margin-bottom: 15px; background: #333; color: white; border: 1px solid #555; border-radius: 4px; font-family: monospace;" 
            />

            <div>
                ${visibleUpdates.map(u => html`
                    <div class="log" @click=${() => this.highlightComponent(u.id)} style="cursor: pointer; position: relative; margin-left: ${u.causedByTag ? '10px' : '0'}; border-left: ${u.causedByTag ? '2px solid #ff9800' : 'none'}; padding-left: ${u.causedByTag ? '6px' : '0'};">
                        <div>
                            ${u.causedByTag ? html`<div style="color: #ff9800; font-size: 10px; margin-bottom: 2px;">↳ caused by &lt;${u.causedByTag}&gt;</div>` : ''}
                            <strong>&lt;${u.tag}&gt;</strong> 
                            <span class="props">(${Object.keys(u.changedProps).join(', ') || 'forced update'})</span>
                        </div>
                        <span style="color: ${u.duration > 8 ? '#ffcc00' : '#4cd964'}">
                            ${u.duration.toFixed(1)}ms
                        </span>
                    </div>
                `)}
                ${visibleUpdates.length === 0 ? html`<em style="color: #666;">No component updates match your filter.</em>` : ''}
            </div>
        `;
    }
}
