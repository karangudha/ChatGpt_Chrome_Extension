chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const question = request.message;

    chrome.storage.sync.get(['openAIApiKey'], async ({ openAIApiKey }) => {
        if (!openAIApiKey) {
            sendResponse({ error: "API key not set." });
            return;
        }
        try {
            const answer = await callLLMAPI(question, openAIApiKey);
            console.log("LLM answer:", answer);
            sendResponse({ text: answer });
        } catch (err) {
            sendResponse({ error: err.message });
        }
    });

    return true;
});

// Call LLM API (stub, replace with actual implementation)
async function callLLMAPI(question, apiKey) {
    const payload = {
        contents: [
            { 
                parts: [{ text: question }] 
            }
        ]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, 
        {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{text: question}],
                    }
                ]
            })
    });
    
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}
