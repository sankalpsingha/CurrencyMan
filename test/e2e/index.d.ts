// TypeScript declarations for test/e2e
// This file is used to satisfy the TypeScript compiler's requirement for input files

// Declare the test utilities
declare module '../helpers/test-utils' {
  export function selectElementText(page: any, selector: string): Promise<void>;
  export function waitForConversionPopup(page: any, timeout?: number): Promise<any>;
  export function getConversionPopupText(page: any): Promise<string>;
}

// Declare the extension helpers
declare module '../helpers/extension-helpers' {
  export function loadExtension(browser: any, browserName: string): Promise<any>;
  export function getExtensionId(page: any, browserName: string): Promise<string>;
}
