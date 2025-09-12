chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const question = request.message;
    
    chrome.storage.local.get(['accessToken'], async ({ accessToken }) => {
        if (!accessToken) {
            sendResponse({ error: "Token not found." });
            return;
        }
        try {
            const answer = await callLLMAPI(question, accessToken);
            sendResponse({ text: answer });
        } catch (err) {
            sendResponse({ error: err.message });
        }
    });

    return true;
});

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

