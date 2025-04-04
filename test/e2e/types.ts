// TypeScript types for test/e2e
// This file is used to satisfy the TypeScript compiler's requirement for input files

// Define types for the test utilities
export interface TestUtils {
  selectElementText: (page: any, selector: string) => Promise<void>;
  waitForConversionPopup: (page: any, timeout?: number) => Promise<any>;
  getConversionPopupText: (page: any) => Promise<string>;
}

// Define types for the extension helpers
export interface ExtensionHelpers {
  loadExtension: (browser: any, browserName: string) => Promise<any>;
  getExtensionId: (page: any, browserName: string) => Promise<string>;
}

// Define types for the test fixtures
export interface TestFixture {
  path: string;
  content: string;
}
