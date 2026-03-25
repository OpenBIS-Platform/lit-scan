"use strict";
(() => {
  // dist/extension/background.js
  var connections = /* @__PURE__ */ new Map();
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "lit-scan-panel") {
      const extensionListener = (message) => {
        if (message.action === "init") {
          connections.set(message.tabId, port);
        } else if (message.type === "HIGHLIGHT_INSTANCE") {
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
  chrome.runtime.onMessage.addListener((request, sender) => {
    if (sender.tab && request.source === "lit-scan-content") {
      const tabId = sender.tab.id;
      if (tabId && connections.has(tabId)) {
        connections.get(tabId)?.postMessage(request.payload);
      }
    }
    return true;
  });
})();
