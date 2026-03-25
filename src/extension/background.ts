/// <reference types="chrome" />

// The background script routes messages between the devtools panel and the inspected page
const connections = new Map<number, chrome.runtime.Port>();

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "lit-scan-panel") {
        const extensionListener = (message: any) => {
            if (message.action === 'init') {
                connections.set(message.tabId, port);
            } else if (message.type === 'HIGHLIGHT_INSTANCE') {
                if (message.tabId) {
                    chrome.tabs.sendMessage(message.tabId, message);
                }
            }
        };

        port.onMessage.addListener(extensionListener);

        port.onDisconnect.addListener((p) => {
            p.onMessage.removeListener(extensionListener);
            for (const [tabId, connection] of connections.entries()) {
                if (connection === p) {
                    connections.delete(tabId);
                    break;
                }
            }
        });
    }
});

// Relay messages from content script to DevTools panel
chrome.runtime.onMessage.addListener((request, sender) => {
    if (sender.tab && request.source === 'lit-scan-content') {
        const tabId = sender.tab.id;
        if (tabId && connections.has(tabId)) {
            connections.get(tabId)?.postMessage(request.payload);
        }
    }
    return true;
});
