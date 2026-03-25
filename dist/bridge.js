/**
 * Serializes changed properties to be safely sent via postMessage
 */
function serializeProps(changedProps) {
    const serialized = {};
    changedProps.forEach((val, key) => {
        // Very rudimentary serialization to prevent DataCloneError
        serialized[String(key)] = {
            oldValue: String(val.oldValue),
            newValue: String(val.newValue)
        };
    });
    return serialized;
}
export function initBridge() {
    window.postMessage({
        source: 'lit-scan-runtime',
        payload: { type: 'INIT_STORE' }
    }, '*');
}
export function emitUpdateData(tag, id, count, duration, changedProps, causedByTag) {
    window.postMessage({
        source: 'lit-scan-runtime',
        payload: {
            type: 'COMPONENT_UPDATE',
            data: {
                tag,
                id,
                count,
                duration,
                changedProps: serializeProps(changedProps),
                causedByTag: causedByTag || null
            }
        }
    }, '*');
}
//# sourceMappingURL=bridge.js.map