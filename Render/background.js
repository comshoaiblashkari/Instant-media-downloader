chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === "DOWNLOAD_DIRECT" && request.url) {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename || "Video.mp4",
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ status: "error", error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ status: "success", downloadId });
      }
    });
    return true;
  }
});

