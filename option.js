document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["openAIApiKey"], ({openAIApiKey}) => {
        if(openAIApiKey) 
            document.getElementById("apikey").value = openAIApiKey;
    });
    document.getElementById("save").addEventListener("click", () => {
        const api_key = document.getElementById("apikey").value.trim();
        if(!api_key) return;
        chrome.storage.sync.set({ openAIApiKey: api_key }, () => {
            document.getElementById("success-message").style.display = "block";
            setTimeout(() => window.close(), 2000);
        });
    });
})