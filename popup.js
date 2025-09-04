document.getElementById("ask").addEventListener("click", () => {
    const input = document.getElementById("userInput").value;
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.tabs.sendMessage(tab.id, { message: input  }, (response) => {
            if(response && response.text)
            {
                document.getElementById("output").innerText = "Result :" + response.text;
            }
        })
    })
})