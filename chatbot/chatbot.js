/**
 * Standalone Church Chatbot
 * Built with Vanilla JS & Tailwind CSS
 */

(function () {
  // --- Global Component State ---
  let faqData = [];
  let isChatOpen = false;
  let isFirstOpen = true;
  let isLoadingFAQ = false;

  // DOM Reference Holders
  let chatWidgetContainer;
  let chatWindow;
  let chatToggleBtn;
  let messagesArea;
  let chatInput;
  let sendBtn;
  let typingIndicator;

  /**
   * Initializes the chatbot component once DOM is ready
   */
  function initializeChatbot() {
    injectStylesAndDOM();
    bindEvents();
    loadFAQ();
  }

  /**
   * Injects Chatbot Widget Elements into Document Body
   */
  function injectStylesAndDOM() {
    chatWidgetContainer = document.createElement('div');
    chatWidgetContainer.id = 'church-chatbot-container';
    chatWidgetContainer.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col items-end font-sans';

    chatWidgetContainer.innerHTML = `
      <!-- Chat Window (Added 'flex' class next to flex-col) -->
      <div id="chat-window" class="hidden flex flex-col w-[calc(100vw-2.5rem)] sm:w-[360px] h-[520px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform scale-95 opacity-0 origin-bottom-right mb-4">
        
        <!-- Header -->
        <div class="bg-primary-900 text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <img src="images/logos.webp" alt="Church Logo" class="w-8 h-8 rounded-full object-cover border border-white/20" onerror="this.src='https://via.placeholder.com/32'">
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-primary-900 rounded-full"></span>
            </div>
            <div>
              <h3 class="font-semibold text-sm leading-tight text-white">Sugam Bot</h3>
              <p class="text-[11px] text-primary-500">Online | Knowledge Assistant</p>
            </div>
          </div>
          <button id="chat-close-btn" class="text-white/70 hover:text-white p-1.5 rounded-lg transition-colors" aria-label="Close Chat">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Chat Messages Container (Scrollable Feed) -->
        <div id="chat-messages" class="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 bg-gray-50/50 scroll-smooth">
          <!-- Dynamic Messages & FAQ Options Will Render Here -->
        </div>

        <!-- Typing Indicator Container -->
        <div id="typing-indicator" class="hidden px-4 py-2 bg-gray-50/50 text-xs text-gray-500 italic flex items-center space-x-1 shrink-0">
          <span>Bot is typing</span>
          <span class="animate-bounce">.</span>
          <span class="animate-bounce [animation-delay:0.2s]">.</span>
          <span class="animate-bounce [animation-delay:0.4s]">.</span>
        </div>

        <!-- Input Area -->
        <form id="chat-form" class="p-3 bg-white border-t border-gray-100 flex items-center space-x-2 shrink-0">
          <input 
            type="text" 
            id="chat-input" 
            placeholder="Ask a question or select above..." 
            class="flex-1 px-4 py-2 bg-gray-100 border border-transparent rounded-full text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-primary-500 transition-all placeholder-gray-400"
            autocomplete="off"
          />
          <button 
            type="submit" 
            id="chat-send-btn" 
            class="bg-primary-500 hover:bg-primary-600 text-white p-2.5 rounded-full transition-all duration-200 shadow-md flex items-center justify-center shrink-0"
            aria-label="Send Message"
          >
            <i class="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </form>
      </div>

      <!-- Floating Trigger Button -->
      <button id="chat-toggle-btn" class="w-14 h-14 bg-primary-900 hover:bg-primary-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none" aria-label="Open Chat">
        <i id="icon-open" class="fa-solid fa-comments text-2xl transition-transform duration-300"></i>
        <i id="icon-close" class="fa-solid fa-chevron-down text-xl hidden transition-transform duration-300"></i>
      </button>
    `;

    document.body.appendChild(chatWidgetContainer);

    // Cache Element References
    chatWindow = document.getElementById('chat-window');
    chatToggleBtn = document.getElementById('chat-toggle-btn');
    messagesArea = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    sendBtn = document.getElementById('chat-send-btn');
    typingIndicator = document.getElementById('typing-indicator');
  }

  /**
   * Binds Event Listeners
   */
  function bindEvents() {
    chatToggleBtn.addEventListener('click', toggleChat);
    document.getElementById('chat-close-btn').addEventListener('click', closeChat);

    document.getElementById('chat-form').addEventListener('submit', function (e) {
      e.preventDefault();
      sendMessage();
    });
  }

  /**
   * Fetches JSON Knowledge Base asynchronously from chatbot/faq.json
   */
  async function loadFAQ() {
    isLoadingFAQ = true;
    try {
      const response = await fetch('chatbot/faq.json');
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      const data = await response.json();
      faqData = data.church_faq || [];

      // If user opened chat before JSON loaded, display questions now
      if (isChatOpen && faqData.length > 0) {
        displayFAQQuestions();
      }
    } catch (error) {
      console.error('Chatbot Error: Could not load knowledge base.', error);
    } finally {
      isLoadingFAQ = false;
    }
  }

  /**
   * Displays all questions from the JSON as clickable buttons inside the chat feed
   */
  function displayFAQQuestions() {
    if (!faqData || faqData.length === 0) return;

    const faqContainer = document.createElement('div');
    faqContainer.className = 'my-3 space-y-2 animate-fade-in w-full shrink-0';

    const label = document.createElement('p');
    label.className = 'text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2 px-1';
    label.innerText = 'Frequently Asked Questions:';
    faqContainer.appendChild(label);

    faqData.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'w-full text-left text-xs bg-white hover:bg-primary-500 hover:text-white text-primary-900 border border-primary-100 font-medium px-3.5 py-2.5 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-between group cursor-pointer';
      btn.innerHTML = `
        <span class="pr-2">${escapeHTML(item.question)}</span>
        <i class="fa-solid fa-chevron-right text-[10px] opacity-40 group-hover:opacity-100 transition-opacity"></i>
      `;

      btn.addEventListener('click', () => {
        handleQuestionClick(item.question, item.answer);
      });

      faqContainer.appendChild(btn);
    });

    messagesArea.appendChild(faqContainer);
    scrollToBottom();
  }

  /**
   * Handles user clicking a predefined question button:
   * 1. Displays the question clicked as a user message
   * 2. Shows typing indicator briefly
   * 3. Displays the matching bot answer
   */
  function handleQuestionClick(question, answer) {
    // 1. Render User Question Bubble
    addMessage(question, 'user');

    // 2. Trigger Typing Indicator
    showTypingIndicator(true);

    setTimeout(() => {
      showTypingIndicator(false);
      // 3. Render Bot Answer Bubble
      addMessage(answer, 'bot');
    }, 400);
  }

  /**
   * Cleans text input: lowercases, strips punctuation and extra spaces
   */
  function normalizeText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Finds matching FAQ entry using word and keyword overlap scoring
   */
  function findBestAnswer(userInput) {
    const cleanInput = normalizeText(userInput);
    if (!cleanInput || faqData.length === 0) return null;

    const inputWords = cleanInput.split(' ');
    let bestMatch = null;
    let highestScore = 0;

    faqData.forEach((item) => {
      let score = 0;
      const cleanQuestion = normalizeText(item.question);
      const cleanKeywords = (item.keywords || []).map((k) => normalizeText(k));

      // Check exact/phrase keyword matches
      cleanKeywords.forEach((keyword) => {
        if (cleanInput.includes(keyword)) {
          score += 5;
        }
      });

      // Check individual token matches
      inputWords.forEach((word) => {
        if (word.length < 2) return;

        cleanKeywords.forEach((keyword) => {
          if (keyword.split(' ').includes(word)) {
            score += 1;
          }
        });

        if (cleanQuestion.split(' ').includes(word)) {
          score += 1;
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    });

    return highestScore > 0 ? bestMatch.answer : null;
  }

  /**
   * Handles manual user text submission
   */
  function sendMessage() {
    const rawText = chatInput.value;
    const cleanText = rawText.trim();

    if (!cleanText) return;

    addMessage(cleanText, 'user');
    chatInput.value = '';

    showTypingIndicator(true);

    setTimeout(() => {
      showTypingIndicator(false);

      if (isLoadingFAQ) {
        addMessage("Database loading... Please try again in a moment.", 'bot');
        return;
      }

      const answer = findBestAnswer(cleanText);

      if (answer) {
        addMessage(answer, 'bot');
      } else {
        addMessage(
          "Sorry, I couldn't find an answer for that. Click one of the questions above or contact the church administration.",
          'bot'
        );
      }
    }, 500);
  }

  /**
   * Appends a message bubble into the chat feed
   */
  function addMessage(text, sender) {
    const isUser = sender === 'user';
    const messageWrapper = document.createElement('div');
    messageWrapper.className = `flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in shrink-0`;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sanitizedText = escapeHTML(text).replace(/\n/g, '<br/>');

    messageWrapper.innerHTML = `
      <div class="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
        isUser
          ? 'bg-primary-500 text-white rounded-br-none shadow-sm'
          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
      }">
        ${sanitizedText}
      </div>
      <span class="text-[10px] text-gray-400 mt-1 px-1">${timestamp}</span>
    `;

    messagesArea.appendChild(messageWrapper);
    scrollToBottom();
  }

  /**
   * Toggles chat window visibility
   */
  function toggleChat() {
    if (isChatOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  /**
   * Opens chat window and sets up initial greeting + JSON questions
   */
  function openChat() {
    isChatOpen = true;
    chatWindow.classList.remove('hidden');

    setTimeout(() => {
      chatWindow.classList.remove('scale-95', 'opacity-0');
      chatWindow.classList.add('scale-100', 'opacity-100');
    }, 10);

    // Toggle Icons
    document.getElementById('icon-open').classList.add('hidden');
    document.getElementById('icon-close').classList.remove('hidden');

    // Automatic Greeting and Question List on First Open
    if (isFirstOpen) {
      addMessage("👋 Jai Masih! Welcome to Sugam Prathana Bhawan.\nHow can we help you today?", 'bot');
      displayFAQQuestions();
      isFirstOpen = false;
    }

    chatInput.focus();
    scrollToBottom();
  }

  /**
   * Closes chat window
   */
  function closeChat() {
    isChatOpen = false;
    chatWindow.classList.remove('scale-100', 'opacity-100');
    chatWindow.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
      chatWindow.classList.add('hidden');
    }, 300);

    document.getElementById('icon-open').classList.remove('hidden');
    document.getElementById('icon-close').classList.add('hidden');
  }

  /**
   * Shows or hides the typing animation
   */
  function showTypingIndicator(show) {
    if (show) {
      typingIndicator.classList.remove('hidden');
    } else {
      typingIndicator.classList.add('hidden');
    }
    scrollToBottom();
  }

  /**
   * Reliably scrolls the message container to bottom
   */
  function scrollToBottom() {
    setTimeout(() => {
      if (messagesArea) {
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }
    }, 50);
  }

  /**
   * Security utility to sanitize raw text strings preventing XSS
   */
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  }

  // --- Initialize when DOM is fully loaded ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
  } else {
    initializeChatbot();
  }
})();