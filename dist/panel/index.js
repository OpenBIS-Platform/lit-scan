import { store } from '../store.js';
let panelContainer = null;
let updateInterval = null;
let isDragging = false;
let startX = 0;
let startY = 0;
let initialRight = 20;
let initialBottom = 20;
let currentRight = 20;
let currentBottom = 20;
export function initPanel() {
    if (panelContainer)
        return;
    panelContainer = document.createElement('div');
    panelContainer.id = 'lit-scan-panel';
    // Container styling
    panelContainer.style.position = 'fixed';
    panelContainer.style.bottom = `${currentBottom}px`;
    panelContainer.style.right = `${currentRight}px`;
    panelContainer.style.width = '320px';
    panelContainer.style.maxHeight = '400px';
    panelContainer.style.backgroundColor = '#1e1e1e';
    panelContainer.style.color = '#fff';
    panelContainer.style.fontFamily = 'monospace';
    panelContainer.style.fontSize = '12px';
    panelContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    panelContainer.style.zIndex = '2147483647';
    panelContainer.style.borderRadius = '8px';
    panelContainer.style.display = 'flex';
    panelContainer.style.flexDirection = 'column';
    panelContainer.style.overflow = 'hidden';
    panelContainer.style.border = '1px solid #333';
    document.body.appendChild(panelContainer);
    renderPanel();
    // Poll to update UI
    updateInterval = setInterval(renderPanel, 1000);
    // Basic drag functionality for the header
    setupDragging();
}
export function teardownPanel() {
    if (panelContainer) {
        panelContainer.remove();
        panelContainer = null;
    }
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}
function setupDragging() {
    const onMouseMove = (e) => {
        if (!isDragging || !panelContainer)
            return;
        const dx = startX - e.clientX;
        const dy = startY - e.clientY;
        currentRight = initialRight + dx;
        currentBottom = initialBottom + dy;
        panelContainer.style.right = `${currentRight}px`;
        panelContainer.style.bottom = `${currentBottom}px`;
    };
    const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    // We'll attach mousedown in the render block to the header element
    window.__litScanStartDrag = (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialRight = currentRight;
        initialBottom = currentBottom;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };
}
function renderPanel() {
    if (!panelContainer)
        return;
    const data = store.getData();
    // Sort hot components
    const hot = Array.from(data.hotComponents.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    // Recent updates 
    const recent = [...data.recentUpdates].reverse().slice(0, 10);
    // Instead of completely replacing standard DOM and killing scroll, we will replace innerHTML 
    // but only of the content area. We'll setup the layout on first render if missing.
    if (!panelContainer.innerHTML) {
        panelContainer.innerHTML = `
      <div 
        style="padding: 10px; background: #2d2d2d; cursor: grab; border-bottom: 1px solid #444; display: flex; justify-content: space-between; align-items: center;"
        onmousedown="window.__litScanStartDrag(event)"
      >
        <strong style="color: #ff5555; font-size: 14px;">🔥 lit-scan</strong>
        <span style="font-size: 10px; color: #888;">drag to move</span>
      </div>
      <div id="lit-scan-panel-content" style="padding: 10px; overflow-y: auto; flex: 1;"></div>
    `;
    }
    const contentDiv = panelContainer.querySelector('#lit-scan-panel-content');
    if (!contentDiv)
        return;
    const html = `
    <div style="margin-bottom: 15px;">
      <strong style="color: #aaa; text-transform: uppercase; font-size: 10px;">Hot Components</strong>
      <ul style="list-style: none; padding: 0; margin: 5px 0;">
        ${hot.map(([tag, count]) => `
          <li style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #4fc1ff;">&lt;${tag}&gt;</span>
            <span style="color: #ccc;">${count}</span>
          </li>`).join('')}
        ${hot.length === 0 ? '<li style="color: #666; font-style: italic;">No updates yet</li>' : ''}
      </ul>
    </div>

    <div>
      <strong style="color: #aaa; text-transform: uppercase; font-size: 10px;">Recent Updates</strong>
      <ul style="list-style: none; padding: 0; margin: 5px 0;">
        ${recent.map(r => {
        let durationColor = '#4cd964';
        if (r.duration > 8)
            durationColor = '#ffcc00';
        if (r.duration > 16)
            durationColor = '#ff3b30';
        return `
          <li style="margin-bottom: 6px; border-bottom: 1px solid #333; padding-bottom: 4px; display: flex; justify-content: space-between;">
            <span style="color: #4fc1ff;">&lt;${r.tag}&gt;</span> 
            <span style="color: ${durationColor};">${r.duration.toFixed(1)}ms</span>
          </li>
        `;
    }).join('')}
        ${recent.length === 0 ? '<li style="color: #666; font-style: italic;">No recent updates</li>' : ''}
      </ul>
    </div>
  `;
    contentDiv.innerHTML = html;
}
//# sourceMappingURL=index.js.map