import { store } from './store.js';

/**
 * Serializes changed properties to be safely sent via postMessage
 */
function serializeProps(changedProps: Map<PropertyKey, { oldValue: unknown, newValue: unknown }>) {
    const serialized: Record<string, any> = {};
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

export function emitUpdateData(tag: string, count: number, duration: number, changedProps: Map<PropertyKey, any>, causedByTag?: string) {
    window.postMessage({
        source: 'lit-scan-runtime',
        payload: {
            type: 'COMPONENT_UPDATE',
            data: { 
                tag, 
                count, 
                duration, 
                changedProps: serializeProps(changedProps),
                causedByTag: causedByTag || null
            }
        }
    }, '*');
}
