//this function gets the text from the webpage : web scraping, it only take text from <p> and <article> tags
function getText() {
    const article = document.querySelector('article');
    if(article) return article.innerText;

    const paragraphs = Array.from(document.getElementsByTagName('p'));
    return paragraphs.map(p => p.innerText).join('\n');

}
//this function calls when we hit ask button
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action = "GET_TEXT"){
        const text = getText();
        sendResponse({ text });//sending text to popup.js
    }
});