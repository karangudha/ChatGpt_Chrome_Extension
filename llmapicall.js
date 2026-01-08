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
                            // text: `Task: Act as a Professional Tech Recruiter and Content Creator.

                            // Convert the provided Job Description into a concise, high-engagement LinkedIn-style hiring post using the format below.

                            // Format:
                            // - Start with #Hiring
                            // - "[Company Name] is hiring for [Job Role]"

                            // Fields to include:
                            // • Experience: [Experience Needed]
                            // • Expected Salary: [Competitive/Market Standard if not provided]
                            // • Location: [Location]

                            // CTA:
                            // • "Expiring soon" + Application Link

                            // Engagement:
                            // • "Check this out before applying" + Secondary Link
                            // • "Follow [Recruiter Name] for more updates"

                            // Footer:
                            // • Use 2–3 hashtags (e.g. #hiring #techupdates)

                            // Input Fields:
                            // Company
                            // Role
                            // Experience Needed
                            // Location
                            // Application Link
                            // Secondary Link
                            // Recruiter Name

                            // Job Description:
                            // [PASTE JD HERE]`
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