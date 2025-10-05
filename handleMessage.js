chrome.runtime.sendMessage({action : "refreshAccessToken"});

class ChatApp {
    constructor() {
        this.message = [];
        this.isLoading = false;
        this.messageIdCounter = 0;

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.messagesContainer = document.getElementById("messagesContainer");
        this.messageInput = document.getElementById("messageInput");
        this.chatForm = document.getElementById("chatForm");
        this.sendButton = document.getElementById("sendButton");
        this.sendIcon = document.querySelector(".send-icon");
        this.loadingIcon = document.querySelector(".loading-icon");
    }

    setupEventListeners() {
        this.chatForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSendMessage();
        });

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
        
        chrome.storage.local.get("selectedText", (data) => {
            if(data.selectedText){
                this.messageInput.value = data.selectedText;
                chrome.storage.local.remove("selectedText");
            }
        })

       

        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextArea();
        });

        this.messageInput.addEventListener('input', () => {
            this.updateSendButtonState();
        });

        this.updateSendButtonState();
    }

    autoResizeTextArea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 192) + 'px';
    }

    updateSendButtonState(){
        const hasText = this.messageInput.value.trim().length;
        this.sendButton.disabled = this.isLoading || !hasText;
    }

    async handleSendMessage() {
        const text = this.messageInput.value.trim();
        if(!text || this.isLoading) return;

        // add user message
        this.addMessage(text, true);

        // cleat input
        this.messageInput.value = "";
        this.autoResizeTextArea();
        this.updateSendButtonState();

        // set loading state
        this.setLoadingState(true);

        this.showLoadingMessage();

        try {
            // Simulate API call
            // const response = "A cow is a domesticated farm animal that is widely known for its gentle nature and importance to human society. It is a herbivore, primarily feeding on grass, and plays a significant role in agriculture by providing milk, meat, leather, and dung, which can be used as fertilizer or fuel. Cows are social animals, often forming close bonds with other members of their herd, and they have a strong maternal instinct. In many cultures, cows hold cultural or religious significance; for example, in India, they are considered sacred and revered. Overall, cows are not only valuable for their economic contributions but also respected for their calm and nurturing presence.";
            const response = await askQuestion(text);
            this.removeLoadingMessage();
            
            this.addMessage(response, false);
        } catch (error) {
            console.error("Error fetching response:", error);
            this.removeLoadingMessage();
            this.addMessage("Something went wrong. ${error.message || error}", false);
        } finally {
            this.setLoadingState(false);
        }
    }

    addMessage(text, isUser)
    {
        const messageId = `message-${++this.messageIdCounter}`; // message-10
        const timestamp = new Date();

        //save the message
        this.message.push({
            id: messageId,
            text, 
            isUser,
            timestamp
        });

        //message element
        const messageElement = this.createMessageElement(messageId, text, isUser, timestamp);

        //add msg in container
        this.messagesContainer.appendChild(messageElement);

        this.scrollToBottom();
    };

    createMessageElement(messageId, text, isUser, timestamp)
    {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${isUser ? "user-message" : "ai-message"}`;
        messageDiv.setAttribute('data-message-id', messageId);

        const conntentDiv = document.createElement("div");
        conntentDiv.className = "message-content";

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = `message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`;
        
        // Format content based on whether it's user or AI message
        if (isUser) {
            const textP = document.createElement('p');
            textP.textContent = text;
            bubbleDiv.appendChild(textP);
        } else {
            // For AI messages, parse and render markdown
            bubbleDiv.innerHTML = this.formatMarkdown(text);
            setTimeout(() => {
                bubbleDiv.querySelectorAll('pre code').forEach((block) => {
                    if (typeof hljs !== 'undefined') {
                        hljs.highlightElement(block);
                    }
                });
            }, 0);
        }
        
        conntentDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(conntentDiv);        

        return messageDiv;
    };

    showLoadingMessage()
    {
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "loading-message";
        loadingDiv.id = "loadingMessage";

        loadingDiv.innerHTML = `
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        `;

        this.messagesContainer.appendChild(loadingDiv);
        this.scrollToBottom();
    }

    removeLoadingMessage() 
    {
        const loadingMessage = document.getElementById("loadingMessage");
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    setLoadingState(loading)
    {
        this.isLoading = loading;
        this.updateSendButtonState();

          if (loading) {
            this.sendIcon.classList.add('hidden');
            this.loadingIcon.classList.remove('hidden');
        } else {
            this.sendIcon.classList.remove('hidden');
            this.loadingIcon.classList.add('hidden');
        }
    }

    scrollToBottom()
    {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 50)
    };

    formatTime(date)
    {
        return date.toLocaleTimeString([],{
            hour: '2-digit',
            minute: '2-digit' 
        });
    }

    formatMarkdown(text) {
        if (typeof marked !== 'undefined') {
            // Configure marked options
            marked.setOptions({
                breaks: true,
                gfm: true
            });
            
            return marked.parse(text);
        }
        // Fallback if marked is not loaded
        return `<p>${text}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('textarea').focus();
    new ChatApp();
});

