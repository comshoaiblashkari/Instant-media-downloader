chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === "DOWNLOAD_VIDEO" && request.url) {
    console.log("Received download request for:", request.url);

    // Trigger Chrome's built-in download manager
    chrome.downloads.download({
      url: request.url,
      filename: "YouTube_Video.mp4"
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ status: "error", message: chrome.runtime.lastError.message });
      } else {
        sendResponse({ status: "success", downloadId: downloadId });
      }
    });

    return true; // Keep channel open for async response
  }
});
