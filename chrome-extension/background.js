// Background service worker - intercepts network requests to find m3u8 links

// Store detected m3u8 links per tab
const detectedLinks = {};

// Listen for network requests containing .m3u8
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.url.includes('.m3u8')) {
      const tabId = details.tabId;
      if (tabId < 0) return; // Ignore non-tab requests

      if (!detectedLinks[tabId]) {
        detectedLinks[tabId] = [];
      }

      // Don't add duplicates
      if (!detectedLinks[tabId].includes(details.url)) {
        detectedLinks[tabId].push(details.url);

        // Update badge count safely inside a try-catch block
        try {
          chrome.action.setBadgeText({
            text: detectedLinks[tabId].length.toString(),
            tabId: tabId,
          }).catch(() => {});
          
          chrome.action.setBadgeBackgroundColor({
            color: '#C6A55C',
            tabId: tabId,
          }).catch(() => {});

          // Notify content script
          chrome.tabs.sendMessage(tabId, {
            type: 'M3U8_DETECTED',
            url: details.url,
            allLinks: detectedLinks[tabId],
          }).catch(() => {}); // Content script might not be loaded yet
        } catch (e) {
          // Ignore sync errors for missing tabs
        }
      }
    }
  },
  {
    urls: [
      '*://*.xalaflix.design/*',
      '*://*.cinepulse.lol/*',
      '*://*.cinepulse.to/*',
      '*://*.veloa.my/*',
      '<all_urls>', // Catch all m3u8 requests
    ],
  }
);

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  delete detectedLinks[tabId];
});

// Clean up when tab navigates
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // We NO LONGER clear on loading because we want to accumulate links across episodes!
  // The user can manually clear them using the trash button in the popup.
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_LINKS') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      sendResponse({ links: detectedLinks[tabId] || [] });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'CLEAR_LINKS') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        detectedLinks[tabId] = [];
        chrome.action.setBadgeText({ text: '', tabId: tabId }).catch(() => {});
      }
      sendResponse({ success: true });
    });
    return true;
  }
});
