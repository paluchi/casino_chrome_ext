chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    tab.url?.includes("whatsapp") &&
    tab?.title === "WhatsApp" &&
    changeInfo?.status === "complete"
  ) {
    // get api key
    chrome.storage.sync.get(["apiKey"], function (result) {
      const apiKey = result.apiKey;
      chrome.tabs.sendMessage(tabId, {
        type: "NEW_TAB",
        apiKey: apiKey,
      });
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "saveApiKey") {
    chrome.storage.sync.set({ apiKey: request.key }, function () {
      // Query all tabs with the WhatsApp Web URL
      chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, function (tabs) {
        for (let tab of tabs) {
          // Reload each tab
          chrome.tabs.reload(tab.id);
        }
      });

      sendResponse({ message: "API Key saved and WhatsApp Web tabs reloaded" });
    });
    return true; // This will keep the message channel open until `sendResponse` is called
  }
});
