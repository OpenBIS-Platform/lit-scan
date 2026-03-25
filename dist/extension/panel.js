var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/// <reference types="chrome" />
import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
let LitScanPanelApp = class LitScanPanelApp extends LitElement {
    constructor() {
        super(...arguments);
        this.updates = [];
        this.filterText = '';
        this.port = null;
    }
    static { this.styles = css `
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
    `; }
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
            }
            else if (msg.type === 'INIT_STORE') {
                this.updates = []; // reset on page load
            }
        });
    }
    render() {
        const visibleUpdates = this.updates.filter(u => u.tag.toLowerCase().includes(this.filterText.toLowerCase()));
        return html `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h2>🔥 lit-scan DevTools</h2>
                <button @click=${() => this.updates = []} style="background: #444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">Clear Logs</button>
            </div>
            
            <input 
                type="text" 
                placeholder="Filter by component tag..." 
                .value=${this.filterText}
                @input=${(e) => this.filterText = e.target.value}
                style="width: 100%; padding: 8px; box-sizing: border-box; margin-bottom: 15px; background: #333; color: white; border: 1px solid #555; border-radius: 4px; font-family: monospace;" 
            />

            <div>
                ${visibleUpdates.map(u => html `
                    <div class="log">
                        <div>
                            <strong>&lt;${u.tag}&gt;</strong> 
                            ${u.causedByTag ? html `<span style="color: #ff9800; font-size: 10px; margin: 0 4px;">(caused by &lt;${u.causedByTag}&gt;)</span>` : ''}
                            <span class="props">(${Object.keys(u.changedProps).join(', ') || 'forced update'})</span>
                        </div>
                        <span style="color: ${u.duration > 8 ? '#ffcc00' : '#4cd964'}">
                            ${u.duration.toFixed(1)}ms
                        </span>
                    </div>
                `)}
                ${visibleUpdates.length === 0 ? html `<em style="color: #666;">No component updates match your filter.</em>` : ''}
            </div>
        `;
    }
};
__decorate([
    state()
], LitScanPanelApp.prototype, "updates", void 0);
__decorate([
    state()
], LitScanPanelApp.prototype, "filterText", void 0);
LitScanPanelApp = __decorate([
    customElement('lit-scan-panel-app')
], LitScanPanelApp);
export { LitScanPanelApp };
//# sourceMappingURL=panel.js.map