import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';
import * as path from 'path';

// Note: Testing Chrome extensions requires headful mode, or the new headless mode in recent Puppeteer versions.
const EXTENSION_PATH = path.resolve(__dirname, '../dist/extension');

describe('lit-scan DevTools Extension E2E', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        // Launch a browser with our unpacked extension
        browser = await puppeteer.launch({
            headless: 'new', // new headless mode supports extensions better, or false for local debug
            args: [
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`,
                '--no-sandbox'
            ]
        });
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    it('should successfully launch the browser with the extension loaded', async () => {
        page = await browser.newPage();
        
        // We can't easily open the actual DevTools panel programmatically in Puppeteer,
        // but we can load the panel.html page directly to verify it boots up and renders the UI!
        
        // Give the service worker time to register and mount
        await new Promise(r => setTimeout(r, 1000));
        
        const extensionTargets = await browser.targets();
        console.log('Targets:', extensionTargets.map(t => ({ url: t.url(), type: t.type() })));
        
        const extensionTarget = extensionTargets.find(t => t.type() === 'service_worker' || t.url().includes('extension'));
        
        // If we found any extension target, it means the extension loaded successfully
        expect(extensionTarget).toBeDefined();

        // Navigate directly to the panel HTML to ensure the Lit component registers
        // We need the extension ID to form the URL, which we can extract from the target
        const url = extensionTarget?.url() || '';
        const match = url.match(/chrome-extension:\/\/([^\/]+)/);
        
        if (match && match[1]) {
            const extensionId = match[1];
            await page.goto(`chrome-extension://${extensionId}/panel.html`);
            
            // Wait for the Lit element to be defined and rendered
            await page.waitForSelector('lit-scan-panel-app');
            
            // Extract the heading text to verify - poll until Lit renders
            const headingText = await page.evaluate(() => {
                return new Promise<string | null>(resolve => {
                    const check = () => {
                        const app = document.querySelector('lit-scan-panel-app');
                        const h2 = app?.shadowRoot?.querySelector('h2');
                        if (h2) {
                            resolve(h2.textContent);
                        } else {
                            setTimeout(check, 50);
                        }
                    };
                    check();
                });
            });
            
            expect(headingText).toContain('lit-scan DevTools');
        }
    }, 15000);
});
