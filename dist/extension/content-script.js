"use strict";
(() => {
  // dist/extension/content-script.js
  window.addEventListener("message", (event) => {
    if (event.source !== window)
      return;
    if (event.data && event.data.source === "lit-scan-runtime") {
      try {
        chrome.runtime.sendMessage({
          source: "lit-scan-content",
          payload: event.data.payload
        });
      } catch (e) {
      }
    }
  });
})();
