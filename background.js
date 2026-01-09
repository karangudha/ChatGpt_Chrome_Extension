const redirectUri = chrome.identity.getRedirectURL();
const clientID = "796946331955-0jemi6j3pdntcb004mv0a4fbbdgcgkvu.apps.googleusercontent.com"
const CLIENT_SECRET = "";
const scopes = ["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/generative-language.retriever", "https://www.googleapis.com/auth/generative-language.peruserquota"];
let authUrl = "https://accounts.google.com/o/oauth2/auth"
authUrl += `?client_id=${clientID}`
authUrl += `&response_type=code`
authUrl += `&access_type=offline`
authUrl += `&prompt=consent`
authUrl += `&redirect_uri=${encodeURIComponent(redirectUri)}`
authUrl += `&scope=${encodeURIComponent(scopes.join(" "))}`;
const VALIDATION_BASE_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";

const injectedTabs = new Set();

chrome.runtime.onInstalled.addListener(() => {
    login();
});

async function refreshLogin() {
    const { expireAt } = await chrome.storage.local.get(['expireAt']);
    if (Date.now() > expireAt - 60000) {
        await refreshAccess();
    }
}
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "refreshAccessToken")
        refreshLogin();
})
async function refreshAccess() {
    const url = "https://oauth2.googleapis.com/token";
    const { refreshToken } = await chrome.storage.local.get(['refreshToken']);

    const body = new URLSearchParams({
        client_id: clientID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
    });

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString(),
    });

    const data = await res.json();
    await saveTokenAndTime(data.access_token, refreshToken, Date.now() + data.expires_in * 1000);
}
async function login() {
    try {
        const token = await getAccessToken();
        const time = Date.now() + token.expires_in * 1000;
        await saveTokenAndTime(token.access_token, token.refresh_token, time);
    } catch (err) {
        logError(err);
    }
}
function logError(error) {
    console.error(`Error: ${error}`);
}

function saveTokenAndTime(access_token, refresh_token, time) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ accessToken: access_token, refreshToken: refresh_token, expireAt: time }).then(() => {
            resolve(true);
        });
    });
}

async function getAccessToken() {
    //authorize function will return a redirect URL, then validate function will extract the token from the URL
    try {
        const redirectURL = await authorize();
        const token = exchangeToken(redirectURL);
        return token;
    } catch (error) {
        console.error("Error during authentication:", error);
    }
}

async function exchangeToken(redirectURL) {
    const url = new URL(redirectURL);
    const code = url.searchParams.get("code");

    const exchangeUrl = "https://oauth2.googleapis.com/token"
    const body = new URLSearchParams({
        client_id: clientID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirectUri: `https://${chrome.runtime.id}.chromiumapp.org/`,
        grant_type: "authorization_code"
    });

    const response = await fetch(exchangeUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Token exchange failed:", data);
        throw new Error(data.error || "Token exchange failed");
    }

    return data;
}

//AUTHORIZE FUNTION WILL RETURN A REDIRECT URL, WHICH CONTAINS THE Code
function authorize() {
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
