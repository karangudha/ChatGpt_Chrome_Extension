const redirectUri = chrome.identity.getRedirectURL();
const clientID = ""
const scopes = ["https://www.googleapis.com/auth/cloud-platform","https://www.googleapis.com/auth/generative-language.retriever","https://www.googleapis.com/auth/generative-language.peruserquota"];
let authUrl = "https://accounts.google.com/o/oauth2/auth"
    authUrl += `?client_id=${clientID}`
    authUrl += `&response_type=token`
    authUrl += `&redirect_uri=${encodeURIComponent(redirectUri)}`
    authUrl += `&scope=${encodeURIComponent(scopes.join(" "))}`;
const VALIDATION_BASE_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";

const injectedTabs = new Set();

chrome.runtime.onInstalled.addListener(() => {
    login();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if(msg.action == "refreshAccessToken")
        login();
})

async function login() {
    try {
        const token = await getAccessToken();
        await saveToken(token);
    } catch (err) {
        logError(err);
    }
}
function logError(error)
{
    console.error(`Error: ${error}`);
}

function saveToken(token)
{
    return new Promise((resolve) => {
        chrome.storage.local.set({accessToken : token}).then(() => {
            resolve(true);
        });
    });
}

async function getAccessToken() {
    //authorize function will return a redirect URL, then validate function will extract the token from the URL
    try {
        const redirectURL = await authorize();
        const token = validate(redirectURL);
        return token;
    } catch (error) {
        console.error("Error during authentication:", error);
    }
}

//AUTHORIZE FUNTION WILL RETURN A REDIRECT URL, WHICH CONTAINS THE TOKEN
function authorize()
{
    return new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow({
            url: authUrl,
            interactive: true
        },
        (redirectURL) => {
            if (chrome.runtime.lastError) {
            console.error("launchWebAuthFlow error:", chrome.runtime.lastError.message);
            return reject(chrome.runtime.lastError.message);
        }
        if (!redirectURL) {
            console.error("No redirect URL returned");
            return reject("Authorization failed: no redirect URL");
        }
            resolve(redirectURL);
        })
    })
}

//VALIDATE FUNCTION 
function validate(redirectURL)
{
    const accessToken = extractAccessToken(redirectURL);
    if(!accessToken)
        throw "Authorization faliure";

    //validate the token by calling the validation endpoint
    const validationUrl = `${VALIDATION_BASE_URL}?access_token=${accessToken}`;
    const validationRequest = new Request(validationUrl, { method: "GET" });

    function checkResponse(response){
        return new Promise((resolve, reject) => {
            if(response.status != 200)
                return reject("Token validation failed");
            response.json().then((info) => {
                if(info.aud && (info.aud === clientID))
                {
                    resolve(accessToken);
                }
                else
                    reject("Token validation failed");
            });
        });
    }

    return fetch(validationRequest).then(checkResponse);
}

//EXTRACT ACCESS TOKEN FROM THE REDIRECT URL 
function extractAccessToken(redirectURL)
{
    const m = redirectURL.match(/[#?](.*)/);
    if(!m || m.length < 1)
        return null;
    let params = new URLSearchParams(m[1].split("#")[0]);
    return params.get("access_token");
}
