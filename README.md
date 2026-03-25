# lit-scan

A development-only runtime tool for Lit that detects component updates, counts and ranks frequently updating components, and visually highlights them on the page.

Inspired by [React Scan](https://github.com/aidenybai/react-scan), `lit-scan` helps you find and fix performance bottlenecks in your Lit applications by showing exactly what changed, why it changed, and how fast the update was.

## Features

- **Zero configuration**: Just call `scan()` to start instrumenting your components.
- **Visual Overlay**: Draws a pulsing red box around any Lit element that updates, showing its tag, update count, and render duration.
- **Floating Panel**: A minimal, no-dependency overlay panel that ranks the hottest components and shows a livestream of recent updates.
- **Changed Properties**: Hooks directly into Lit's lifecycle to track exactly which properties triggered an update.

## Installation

```bash
npm install lit-scan --save-dev
```

*(Note: Ensure you do not include this in your production bundle!)*

## Usage

Simply import and call `scan()` in your application entry point before your Lit components initialize:

```typescript
import { scan, stopScan, getStore } from 'lit-scan';

// Enable scanning (development only)
if (process.env.NODE_ENV === 'development') {
    scan();
}
```

### Programmatic API

- `scan(options?)`: Injects monkey patches into `ReactiveElement` and mounts the overlays.
- `stopScan()`: Removes the patches, destroys the overlays, and clears the tracking store.
- `getStore()`: Returns the singleton store instance. The store contains raw metrics for custom tooling integrations.

## Limitations

- **Memory overhead**: `lit-scan` tracks component metrics in-memory using a `WeakMap`. While it prevents memory leaks when components are destroyed, tracking hundreds of rapid updates in a huge DOM tree does incur overhead. It is STRICTLY for development.
- **Heuristics**: Measuring performance precisely in JS is hard. The reported duration represents the gap between `performUpdate` and `updated`, which captures rendering and Lit's reconciliation, but may miss layout/paint depending on browser implementation.
- v1 does not have a comprehensive DevTools extension; it relies on an in-page DOM panel.

## License

MIT License
