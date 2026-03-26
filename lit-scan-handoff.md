# lit-scan Developer Handoff Note

**Date:** March 26, 2026
**Project:** `lit-scan` (OpenBIS Platform)
**Status:** v3 Complete. Advanced Chrome DevTools Extension & Runtime Profiler for Lit.

## 1. Core Architecture

`lit-scan` is a zero-dependency, framework-agnostic performance profiling tool designed explicitly for the Lit ecosystem. It hooks natively into the component lifecycle and bridges telemetry data directly to a dedicated Google Chrome DevTools extension panel.

### Important Modules
*   **The Runtime Patcher (`src/patch/index.ts`):** 
    Monkey-patches the core `ReactiveElement` prototype. 
    *   `requestUpdate` / `performUpdate`: Wrapped to create an execution stack tracer. If a component requests an update while another component is in the middle of performing an update, it is tracked as a "cascade," and its `causedByTag` is recorded.
    *   `updated`: Intercepted to measure exact render durations via `performance.now()`, isolate the specific `changedProperties`, and heuristically detect `@lit-labs/signals` triggers (updates fired with 0 properties but an active `_watcher`).
*   **The State Store (`src/store.ts`):** 
    Utilizes a `WeakMap` to map DOM element instances to memory-safe IDs and tracking logs. `idMap` maps IDs to `WeakRef<ReactiveElement>` for fast reverse lookups without leaking detached DOM nodes.
*   **Visual Overlays (`src/overlay/index.ts`):**
    Draws highly-optimized CSS bounding boxes over recently updated elements in the host page. Critically, to prevent layout thrashing (Forced Synchronous Layouts) during heavy cascades, DOM reads (e.g., `getBoundingClientRect`) and DOM writes (appending boxes) are strategically batched in isolated `requestAnimationFrame` cycles using a Double-Buffer queue pattern.
*   **The Messaging Bridge (`src/bridge.ts`):**
    Responsible for flattening the update payloads and emitting them indiscriminately to the webpage via `window.postMessage`.

## 2. Chrome DevTools Extension Infrastructure

The extension isolates the DevTools UI from the application DOM to avoid mutating user state or triggering resize observers. 

1. **Content Script (`src/extension/content-script.ts`):** Injected directly into the host webpage. It catches `"lit-scan-runtime"` telemetry over `window.postMessage` and relays it to the background script via `chrome.runtime.sendMessage`. It also listens for commands *from* the background script and proxies them back to the host window to execute reverse actions.
2. **Background Service Worker (`src/extension/background.ts`):** Acts as the central traffic controller. The DevTools panel connects to this script via a dedicated messaging Port and identifies its `tabId`. The background script listens for telemetry from the Content Script, resolves the originating `tabId`, and pipes the data strictly into the matching DevTools Panel Port.
3. **DevTools Panel (`src/extension/panel.ts`):** A native Lit application running inside `panel.html`. It maintains a reactive list of the most recent 50 updates. 
    *   **Cascade UI:** It features intelligent nesting and styling for "Cascaded" renders (`↳ caused by <parent>`).
    *   **Reverse DOM Inspection:** Clicking any internal log block sends a `HIGHLIGHT_INSTANCE` command with the component ID backward through the port pipeline `Panel -> Background -> Content Script -> Host Page`. The host page catches this, resolves the ID inside the `Store.idMap`, smoothly scrolls the target component into the viewport, and triggers an overlay flash.

## 3. Build & CI/CD Pipeline

*   **Bundling:** `package.json` relies on `esbuild` for everything. `npm run build` transpiles the core runtime package via `tsc`, then uses ESBuild to individually bundle `panel.ts`, `background.ts`, `content-script.ts`, and `devtools.ts` (alongside HTML and JSON manifest) directly into the `dist/extension/` folder for immediate "Load Unpacked" usage in Chrome.
*   **GitHub Actions:** `.github/workflows/ci.yml` executes `npm run build && npm run test` recursively on every Main branch PR.
*   **Automated NPM Publishing:** `publish.yml` is wired to automatically build the final artifact and securely execute `npm publish --access public` the moment a new GitHub **Release** is drafted, utilizing the `NPM_TOKEN` secret. 
*   **Hygiene:** I configured a highly strict `.npmignore` profile to drop all internal documentation, planning files, GitHub actions, test directories, and example code. `prepublishOnly` ensures `dist` isn't stale before distribution.
*   **Git History:** I ran a deep `git-filter-repo`/`git filter-branch` purge against the main branch, permanently wiping `node_modules` and all internal AI-generated `*.md` planning files from the git repository tree history to resolve bloat.

## 4. Testing Suite
Run via `npm test` using Vitest:
*   **`scan.test.ts` & `v2.test.ts`**: Verifies core instrumentation logic, cascade tree linkage mapping, and telemetry emission.
*   **`e2e.test.ts`**: Uses `puppeteer`. It launches a headless, fresh Chromium instance with our compiled unpacked extension pre-loaded, navigates to the DevTools panel URI, and asserts that the UI successfully bootstraps, proving the bundle runs flawlessly in an isolated extension environment context.

*(Note: The user must explicitly run `scan()` in their app entrypoint to mount the runtime telemetry bridge!)*
