"use strict";
(() => {
  // dist/extension/devtools.js
  chrome.devtools.panels.create(
    "Lit Scan",
    "",
    // No icon for now
    "panel.html",
    (panel) => {
      console.log("Lit Scan panel created", panel);
    }
  );
})();
