// This script runs in the context of the inspected webpage, allowing it to read window messages

window.addEventListener('message', (event) => {
    // Ensure the message is from our own page
    if (event.source !== window) return;

    if (event.data && event.data.source === 'lit-scan-runtime') {
        try {
            // Relay the message up to the background service worker
            chrome.runtime.sendMessage({
                source: 'lit-scan-content',
                payload: event.data.payload
            });
        } catch (e) {
            // Fails silently if extension is reloaded/invalidated
        }
    }
});

// Relay commands from DevTools background to the host page
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'HIGHLIGHT_INSTANCE') {
        window.postMessage({ source: 'lit-scan-devtools', payload: request }, '*');
    }
});
