let messageContainer = JSON.parse(sessionStorage.getItem("messageContainer")) || [];
render();
document.getElementById("ask").addEventListener("click", () => {
    if(!isLocked)
        askQuestion();
})
document.getElementById("userInput").addEventListener("keydown", (event) => {
    if(event.key === "Enter" && !isLocked)
        askQuestion();
})

function render() {
    document.getElementById("chatContainer").innerHTML = messageContainer.map(m => `<div class="msg">${m}</div>`).join('');
    document.getElementById("chatContainer").scrollTop = document.getElementById("chatContainer").scrollHeight;
}