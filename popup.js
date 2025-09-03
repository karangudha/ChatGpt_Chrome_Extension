document.getElementById("ask").addEventListener("click", () => {
    const result = document.getElementById("result");
    result.innerText = "Loading...";
    
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {

    });
});