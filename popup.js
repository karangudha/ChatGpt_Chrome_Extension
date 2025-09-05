let messageContainer = JSON.parse(sessionStorage.getItem("messageContainer")) || [];
render();
document.getElementById("ask").addEventListener("click", () => {
    askQuestion();
})
document.getElementById("userInput").addEventListener("keydown", (event) => {
    if(event.key === "Enter")
        askQuestion();
})

function render() {
    document.getElementById("chatContainer").innerHTML = messageContainer.map(m => `<div class="msg">${m}</div>`).join('');
    document.getElementById("chatContainer").scrollTop = document.getElementById("chatContainer").scrollHeight;
}

function askQuestion()
{
    const input = document.getElementById("userInput").value;
    document.getElementById("userInput").value = "";
    if(!input) return;
    messageContainer.push(input);
    sessionStorage.setItem("messageContainer", JSON.stringify(messageContainer));
    render();
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.tabs.sendMessage(tab.id, { message: input  }, (response) => {
            if(response && response.text)
            {
                messageContainer.push(response.text);
                sessionStorage.setItem("messageContainer", JSON.stringify(messageContainer));
                render();
            }
        })
    })
}