let isLocked = false;
async function retrieveAccessToken()
{
    const { accessToken } = await chrome.storage.local.get(['accessToken'])
    if (!accessToken) {
        throw new Error("Token not Found");
    }
    return accessToken; 
}

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
  isLocked = true;
  if(isLocked)
    document.getElementById("ask").style.backgroundImage = 'url("assets/icon-pause.png")';

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
  isLocked = false;
  if(!isLocked)
    document.getElementById("ask").style.backgroundImage = 'url("assets/icon-search.png")';
}

async function callLLMAPI(question, accessToken) {
    const payload = {
        contents: [
            { 
                parts: [{ text: question }] 
            }
        ]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, 
        {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{text: question}],
                    }
                ]
            })
    });
    
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

document.getElementById("userInput").addEventListener("input" , () => {
    document.getElementById("ask").style.backgroundImage = 'url("assets/icon-up-arrow.png")';
})