/**
 * Browser API polyfill to handle differences between Chrome and Firefox
 * 
 * This utility detects the current browser and provides a unified API
 * that works consistently across browsers.
 */

const getBrowserAPI = () => {
  // Check if we're in Firefox (browser namespace exists)
  if (typeof browser !== 'undefined') {
    return browser;
  }
  
  // We're in Chrome or another browser that uses the chrome namespace
  if (typeof chrome !== 'undefined') {
    // Create a simple polyfill for the APIs we use
    const api = { ...chrome };
    
    // Add Promise wrappers for callback-based APIs
    if (chrome.storage && chrome.storage.local) {
      const originalGet = chrome.storage.local.get;
      api.storage = api.storage || {};
      api.storage.local = api.storage.local || {};
      api.storage.local.get = (keys) => new Promise((resolve) => {
        originalGet.call(chrome.storage.local, keys, resolve);
      });
      
      const originalSet = chrome.storage.local.set;
      api.storage.local.set = (items) => new Promise((resolve) => {
        originalSet.call(chrome.storage.local, items, resolve);
      });
    }
    
    // Add more API wrappers as needed for runtime, etc.
    if (chrome.runtime) {
      const originalSendMessage = chrome.runtime.sendMessage;
      api.runtime = api.runtime || {};
      api.runtime.sendMessage = (message) => new Promise((resolve) => {
        originalSendMessage.call(chrome.runtime, message, resolve);
      });
    }
    
    return api;
  }
  
  // Fallback for environments where neither chrome nor browser is available
  console.warn('No browser API found. Using mock implementation.');
  return {
    storage: {
      local: {
        get: () => Promise.resolve({}),
        set: () => Promise.resolve()
      }
    },
    runtime: {
      sendMessage: () => Promise.resolve(),
      onMessage: { addListener: () => {} }
    }
  };
};

export default getBrowserAPI();
