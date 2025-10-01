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
btn.textContent = "Ask AI";
btn.style.cursor = "pointer";
btn.style.border = "1px solid #aaa";
btn.style.borderRadius = "4px";    // rounded corners
btn.style.color = "#9d2121ff";

menu.appendChild(btn);
document.addEventListener('mouseup', (e) => {
    const selection = window.getSelection().toString().trim();
    if(selection.length > 0) {
        menu.style.display = 'block';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
    }else{
        menu.style.display = 'none';
    }
});

btn.addEventListener('click', () => {
    const selection = window.getSelection().toString().trim();
    chrome.storage.local.set({
        selectedText: selection
    })
    menu.style.display = 'none';
})