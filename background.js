chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(["api_key"], (result) => {
        if(!result.api_key){
            chrome.tabs.create({ url: "options.html" });
        }
    });
});