console.log("Vault: background service worker started");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Vault extension installed");
});
