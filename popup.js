// import { retrieveAccessToken, callLLMAPI } from "./llmapicall.js"

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

async function askQuestion() {
  const input = document.getElementById("userInput").value.trim();

  if (!input) {
    messageContainer.push("Please enter your question");
    sessionStorage.setItem("messageContainer", JSON.stringify(messageContainer));
    render();
    return;
  }

  // Clear input field
  document.getElementById("userInput").value = "";
  messageContainer.push(input);
  sessionStorage.setItem("messageContainer", JSON.stringify(messageContainer));
  render();

  try {
    const token = await retrieveAccessToken();
    const answer = await callLLMAPI(input, token);

    messageContainer.push(answer);
    sessionStorage.setItem("messageContainer", JSON.stringify(messageContainer));
    render();
  } catch (error) {
    // Covers both token errors and LLM API errors
    messageContainer.push("Error: " + error.message || error);
    sessionStorage.setItem("messageContainer", JSON.stringify(messageContainer));
    render();
  }
}
