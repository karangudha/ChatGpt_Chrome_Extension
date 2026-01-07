async function retrieveAccessToken() {
    const { accessToken } = await chrome.storage.local.get(['accessToken'])
    if (!accessToken) {
        throw new Error("Token not Found");
    }
    return accessToken;
}

async function askQuestion(input) {
    try {
        const token = await retrieveAccessToken();
        const answer = await callLLMAPI(input, token);
        return answer;
    } catch (error) {
        console.error("Error fetching response:", error);
        return `Something went wrong. ${error.message || error}`;
    }
}

async function callLLMAPI(question, accessToken) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [
                        {
                            text: "You are a helpful assistant and answer as concisely as possible."
                        }
                    ]
                },
                contents: [
                    {
                        role: "user",
                        parts: [{ text: question }],
                    }
                ]
            })
        });
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}