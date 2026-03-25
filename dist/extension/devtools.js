"use strict";
/// <reference types="chrome" />
chrome.devtools.panels.create("Lit Scan", "", // No icon for now
"panel.html", (panel) => {
    console.log("Lit Scan panel created", panel);
});
//# sourceMappingURL=devtools.js.map