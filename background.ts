export {}

// Watch for internal action requests sent from content script contexts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "open_workspace") {
    chrome.runtime.openOptionsPage()
    sendResponse({ success: true })
  }
})
