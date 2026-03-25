import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { SignalWatcher, signal } from '@lit-labs/signals';
import { scan } from '../src/index.js';

// Start scanning immediately for the demo
scan();

@customElement('interval-tester')
export class IntervalTester extends LitElement {
    static styles = css`
        :host { display: block; padding: 20px; border: 1px solid #444; border-radius: 8px; width: 200px; }
        h3 { margin-top: 0; color: #4fc1ff; }
    `;

    @state() count = 0;

    connectedCallback() {
        super.connectedCallback();
        setInterval(() => this.count++, 2000); // 2 seconds
    }

    render() {
        return html`
            <h3>Interval Update</h3>
            <p>Count: ${this.count}</p>
        `;
    }
}

@customElement('prop-churner')
export class PropChurner extends LitElement {
    static styles = css`
        :host { display: block; padding: 20px; border: 1px solid #444; border-radius: 8px; width: 200px; }
        h3 { margin-top: 0; color: #ffcc00; }
    `;

    @property({ type: String }) text = 'init';
    @property({ type: Number }) value = 0;

    connectedCallback() {
        super.connectedCallback();
        setInterval(() => {
            this.text = Math.random().toString(36).substring(7);
            this.value = Math.floor(Math.random() * 100);
        }, 3000); // 3 seconds
    }

    render() {
        return html`
            <h3>Prop Churn</h3>
            <p>Text: ${this.text}</p>
            <p>Value: ${this.value}</p>
        `;
    }
}

@customElement('manual-updater')
export class ManualUpdater extends LitElement {
    static styles = css`
        :host { display: block; padding: 20px; border: 1px solid #444; border-radius: 8px; width: 200px; }
        h3 { margin-top: 0; color: #ff5555; }
        button { background: #ff5555; border: none; padding: 8px 16px; color: white; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%; }
        button:hover { background: #ff3b30; }
    `;

    render() {
        return html`
            <h3>Manual Updater</h3>
            <button @click=${() => this.requestUpdate()}>Trigger update</button>
        `;
    }
}

const sharedCount = signal(0);
setInterval(() => sharedCount.set(sharedCount.get() + 1), 2500);

@customElement('signal-watcher-demo')
export class SignalWatcherDemo extends SignalWatcher(LitElement) {
    static styles = css`
        :host { display: block; padding: 20px; border: 1px solid #444; border-radius: 8px; width: 200px; }
        h3 { margin-top: 0; color: #b78aff; }
    `;

    render() {
        return html`
            <h3>Signal Watcher</h3>
            <p>Shared Signal: ${sharedCount.get()}</p>
        `;
    }
}
