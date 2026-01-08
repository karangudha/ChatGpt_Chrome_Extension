
const menu = document.createElement("div");
menu.className = "menu-button";
menu.style.position = "absolute";
menu.style.display = "none"; // hidden until selection
// menu.style.border = "1px solid #ccc";
// menu.style.padding = "5px";
menu.style.zIndex = "9999"; // make sur
document.body.appendChild(menu);


const btn = document.createElement("button");
btn.className = "ask-ai-button";
btn.id = "Ask";
btn.textContent = "kya haii ?";
btn.style.cursor = "pointer";
btn.style.border = "1px solid #aaa";
btn.style.borderRadius = "4px";    // rounded corners
btn.style.color = "#000000ff";

menu.appendChild(btn);

document.addEventListener('mouseup', () => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || !selection.toString().trim()) {
        menu.style.display = 'none';
        return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getClientRects()[0]; // start of selection

    menu.style.display = 'block';
    menu.style.position = 'absolute';
    menu.style.left = (rect.left + window.scrollX) + 'px';
    menu.style.top = (rect.top + window.scrollY - menu.offsetHeight - 8) + 'px';
});


btn.addEventListener('click', () => {
    const selection = window.getSelection().toString().trim();
    chrome.storage.local.set({
        selectedText: selection
    })
    menu.style.display = 'none';
})