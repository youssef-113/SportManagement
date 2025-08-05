// API Configuration
const API_BASE_URL = window.location.origin;
let authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEyMywidXNlcm5hbWUiOiJNb2hhbWVkU2FsYWgiLCJyb2xlIjoicGxheWVyIn0.1XaGvJYq3dTz9X1G8j0K5u8QzY2b7X3vC1d4E5f6g7H';
let currentUser = null;
let currentChat = null;
let contacts = [];
let emojiPicker = null;
let messagePage = 1;
const MESSAGES_PER_PAGE = 20;
const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥', '⭐', '🎉', '🤔'];

// DOM Elements
const contactsList = document.getElementById('contactsList');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const contactSearch = document.getElementById('contactSearch');
const contactsSidebar = document.getElementById('contactsSidebar');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const currentChatAvatar = document.getElementById('currentChatAvatar');
const currentChatName = document.getElementById('currentChatName');
const currentChatStatus = document.getElementById('currentChatStatus');
const toggleContacts = document.getElementById('toggleContacts');
const loadingSpinner = document.getElementById('loadingSpinner');
const emojiPickerContainer = document.getElementById('emojiPicker');
const emojiBtn = document.getElementById('emojiBtn');

// Initialize the application
async function initApp() {
    try {
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        currentUser = {
            id: payload.uid,
            name: payload.username,
            role: payload.role,
            initials: payload.username.split(' ').map(n => n[0]).join('')
        };
    } catch (e) {
        console.error('Token parsing error:', e);
        showNotification('Authentication error', 'error');
        return;
    }

    userAvatar.textContent = currentUser.initials;
    userName.textContent = currentUser.name;
    userRole.textContent = currentUser.role;

    await loadContacts();
    setupEventListeners();
    setInterval(pollNewMessages, 5000);
    renderEmojiPicker();
}

// API helper function
async function apiCall(action, method = 'GET', body = null) {
    const url = new URL(`${API_BASE_URL}/backend.php/chat.php`);
    url.searchParams.append('action', action);

    const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        showNotification(`API Error: ${error.message}`, 'error');
        console.error('API Error:', error);
        throw error;
    }
}

// Load contacts
async function loadContacts() {
    try {
        loadingSpinner.style.display = 'block';
        const data = await apiCall('contacts');
        contacts = data.data;
        renderContacts();
        loadingSpinner.style.display = 'none';
    } catch (error) {
        loadingSpinner.style.display = 'none';
    }
}

// Render contacts
function renderContacts() {
    contactsList.innerHTML = '';

    // Medical Staff
    contactsList.innerHTML += `<div class="contact-category">Medical Staff</div>`;
    contacts.filter(c => c.role === 'medicalStaff').forEach(contact => {
        contactsList.innerHTML += createContactHTML(contact);
    });

    // Coaching Staff
    contactsList.innerHTML += `<div class="contact-category">Coaching Staff</div>`;
    contacts.filter(c => c.role === 'coach').forEach(contact => {
        contactsList.innerHTML += createContactHTML(contact);
    });

    // Groups
    contactsList.innerHTML += `<div class="contact-category">Team Groups</div>`;
    contacts.filter(c => c.type === 'group').forEach(group => {
        contactsList.innerHTML += createGroupHTML(group);
    });

    // Add event listeners
    document.querySelectorAll('.contact').forEach(contact => {
        contact.addEventListener('click', function () {
            selectChat(
                parseInt(this.dataset.id),
                this.dataset.type,
                this.dataset.isGroup === 'true'
            );
        });
    });
}

// Create contact HTML
function createContactHTML(contact) {
    return `
        <div class="contact" data-id="${contact.id}" data-type="user" data-is-group="false">
            <div class="contact-avatar contact-${contact.role}">${contact.name.charAt(0)}</div>
            <div class="contact-info">
                <h4>${escapeHtml(contact.name)}</h4>
                <p>${escapeHtml(contact.role)}</p>
            </div>
            <div class="contact-status">
                <div class="status-dot ${contact.online ? '' : 'status-offline'}"></div>
                ${contact.unread > 0 ? `<div class="unread-count">${contact.unread}</div>` : ''}
            </div>
        </div>
    `;
}

// Create group HTML
function createGroupHTML(group) {
    return `
        <div class="contact" data-id="${group.id}" data-type="group" data-is-group="true">
            <div class="contact-avatar contact-group">G</div>
            <div class="contact-info">
                <h4>${escapeHtml(group.name)}</h4>
                <p>${escapeHtml(group.role)}</p>
            </div>
            <div class="contact-status">
                ${group.unread > 0 ? `<div class="unread-count">${group.unread}</div>` : ''}
            </div>
        </div>
    `;
}

// Select chat
function selectChat(chatId, type, isGroup) {
    const contact = contacts.find(c => c.id == chatId);
    if (!contact) return;

    currentChat = { ...contact, isGroup };
    messagePage = 1;

    document.querySelectorAll('.contact').forEach(c => c.classList.remove('active'));
    document.querySelector(`.contact[data-id="${chatId}"]`).classList.add('active');

    currentChatName.textContent = contact.name;
    currentChatStatus.textContent = isGroup
        ? contact.role
        : `${contact.role} • ${contact.online ? 'Online' : 'Offline'}`;
    currentChatAvatar.textContent = contact.name.charAt(0);
    currentChatAvatar.className = `chat-avatar contact-${isGroup ? 'group' : contact.role}`;

    contact.unread = 0;
    const unreadEl = document.querySelector(`.contact[data-id="${chatId}"] .unread-count`);
    if (unreadEl) unreadEl.style.display = 'none';

    loadMessages();

    if (window.innerWidth < 768) {
        contactsSidebar.classList.remove('active');
    }
}

// Load messages
async function loadMessages() {
    if (!currentChat) return;

    try {
        messagesContainer.innerHTML = `
            <div class="spinner-container">
                <div class="spinner"></div>
                <p>Loading messages...</p>
            </div>
        `;

        const data = await apiCall(`messages?type=${currentChat.isGroup ? 'group' : 'private'}&chat_id=${currentChat.id}&page=${messagePage}`);
        renderMessages(data.data);

        if (data.data.length === MESSAGES_PER_PAGE) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more';
            loadMoreBtn.textContent = 'Load Older Messages';
            loadMoreBtn.addEventListener('click', () => {
                messagePage++;
                loadMoreMessages();
            });
            messagesContainer.insertBefore(loadMoreBtn, messagesContainer.firstChild);
        }

    } catch (error) {
        showNotification('Failed to load messages', 'error');
    }
}

// Load more messages
async function loadMoreMessages() {
    if (!currentChat) return;

    try {
        const loadMoreBtn = document.querySelector('.load-more');
        if (loadMoreBtn) loadMoreBtn.textContent = 'Loading...';

        const data = await apiCall(`messages?type=${currentChat.isGroup ? 'group' : 'private'}&chat_id=${currentChat.id}&page=${messagePage}`);

        if (data.data.length > 0) {
            const oldScrollHeight = messagesContainer.scrollHeight;
            const oldScrollTop = messagesContainer.scrollTop;

            const fragment = document.createDocumentFragment();
            data.data.reverse().forEach(message => {
                fragment.appendChild(createMessageElement(message));
            });
            messagesContainer.insertBefore(fragment, messagesContainer.firstChild);

            messagesContainer.scrollTop = oldScrollTop + (messagesContainer.scrollHeight - oldScrollHeight);
        }

        if (data.data.length < MESSAGES_PER_PAGE && loadMoreBtn) {
            loadMoreBtn.remove();
        } else if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Load Older Messages';
        }
    } catch (error) {
        showNotification('Failed to load older messages', 'error');
    }
}

// Create message element
function createMessageElement(message) {
    const isCurrentUser = message.sender_id === currentUser.id;
    const sentDate = new Date(message.sent_at);
    const timeString = sentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageElement = document.createElement('div');
    messageElement.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
    messageElement.dataset.id = message.chat_id;

    // Add reaction handler
    messageElement.addEventListener('click', (e) => {
        if (e.target.closest('.reaction') || e.target.closest('.emoji-picker')) return;
        showReactionMenu(messageElement, e);
    });

    let statusHTML = '';
    if (isCurrentUser) {
        let statusIcon = 'fa-check';
        let statusText = 'Sent';

        if (message.status === 'delivered') {
            statusIcon = 'fa-check-double';
            statusText = 'Delivered';
        } else if (message.status === 'seen') {
            statusIcon = 'fa-check-double';
            statusText = 'Seen';
        }

        statusHTML = `
            <div class="message-status ${message.status || 'sent'}">
                <i class="fas ${statusIcon}"></i>
                <span>${statusText}</span>
            </div>
        `;
    }

    let reactionsHTML = '';
    if (message.reactions && message.reactions.length > 0) {
        reactionsHTML = `<div class="reactions-container">`;
        message.reactions.forEach(reaction => {
            reactionsHTML += `
                <div class="reaction ${reaction.user_reacted ? 'user-reacted' : ''}" 
                     data-emoji="${escapeHtml(reaction.emoji)}">
                    ${escapeHtml(reaction.emoji)}
                    <span class="reaction-count">${reaction.count}</span>
                </div>
            `;
        });
        reactionsHTML += `</div>`;
    }

    messageElement.innerHTML = `
        <div class="message-content">${escapeHtml(message.message)}</div>
        ${reactionsHTML}
        <div class="message-footer">
            <div class="message-time">${timeString}</div>
            ${statusHTML}
        </div>
    `;

    // Add event listeners to reactions
    if (message.reactions && message.reactions.length > 0) {
        messageElement.querySelectorAll('.reaction').forEach(reaction => {
            reaction.addEventListener('click', (e) => {
                e.stopPropagation();
                handleReactionClick(message.chat_id, reaction.dataset.emoji);
            });
        });
    }

    return messageElement;
}

// Show reaction menu
function showReactionMenu(messageElement, event) {
    // Remove any existing reaction menu
    document.querySelectorAll('.reaction-menu').forEach(menu => menu.remove());

    const messageId = messageElement.dataset.id;
    const rect = messageElement.getBoundingClientRect();

    const menu = document.createElement('div');
    menu.className = 'reaction-menu';
    menu.style.top = `${rect.top - 40}px`;
    menu.style.left = `${event.clientX - 100}px`;
    menu.dataset.messageId = messageId;

    EMOJI_LIST.forEach(emoji => {
        const button = document.createElement('button');
        button.className = 'emoji-option';
        button.textContent = emoji;
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            handleReactionSelect(messageId, emoji);
        });
        menu.appendChild(button);
    });

    document.body.appendChild(menu);

    // Close menu when clicking elsewhere
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!e.target.closest('.reaction-menu')) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }, 10);
}

// Handle reaction selection
async function handleReactionClick(messageId, emoji) {
    try {
        const response = await apiCall('react', 'POST', {
            chat_id: messageId,
            emoji: emoji
        });

        updateMessageReactions(messageId, response.data.reactions);
    } catch (error) {
        showNotification('Failed to update reaction', 'error');
    }
}

// Handle reaction selection
async function handleReactionSelect(messageId, emoji) {
    try {
        const response = await apiCall('react', 'POST', {
            chat_id: messageId,
            emoji: emoji
        });

        updateMessageReactions(messageId, response.data.reactions);
    } catch (error) {
        showNotification('Failed to add reaction', 'error');
    } finally {
        document.querySelectorAll('.reaction-menu').forEach(menu => menu.remove());
    }
}

// Update message reactions
function updateMessageReactions(messageId, reactions) {
    const messageElement = document.querySelector(`.message[data-id="${messageId}"]`);
    if (!messageElement) return;

    let reactionsHTML = '<div class="reactions-container">';
    reactions.forEach(reaction => {
        reactionsHTML += `
            <div class="reaction ${reaction.user_reacted ? 'user-reacted' : ''}" 
                 data-emoji="${escapeHtml(reaction.emoji)}">
                ${escapeHtml(reaction.emoji)}
                <span class="reaction-count">${reaction.count}</span>
            </div>
        `;
    });
    reactionsHTML += '</div>';

    // Replace reactions container
    const existingContainer = messageElement.querySelector('.reactions-container');
    if (existingContainer) {
        existingContainer.innerHTML = reactionsHTML;
    } else {
        // Insert after message content
        const content = messageElement.querySelector('.message-content');
        content.insertAdjacentHTML('afterend', reactionsHTML);
    }

    // Reattach event listeners
    messageElement.querySelectorAll('.reaction').forEach(reaction => {
        reaction.addEventListener('click', (e) => {
            e.stopPropagation();
            handleReactionClick(messageId, reaction.dataset.emoji);
        });
    });
}

// Render emoji picker
function renderEmojiPicker() {
    emojiPickerContainer.innerHTML = '';

    EMOJI_LIST.forEach(emoji => {
        const button = document.createElement('button');
        button.className = 'emoji-option';
        button.textContent = emoji;
        button.addEventListener('click', () => {
            const message = messageInput.value;
            messageInput.value = message + emoji;
            messageInput.focus();
            emojiPickerContainer.classList.remove('active');
        });
        emojiPickerContainer.appendChild(button);
    });
}

// Send message
async function sendMessage() {
    const messageText = messageInput.value.trim();
    if (!messageText || !currentChat) return;

    const newMessage = {
        id: Date.now(),
        sender_id: currentUser.id,
        content: messageText,
        sent_at: new Date().toISOString(),
        status: 'sent'
    };

    const messageElement = createMessageElement(newMessage);
    messagesContainer.appendChild(messageElement);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const body = {
            message: messageText
        };

        if (currentChat.isGroup) {
            body.group_id = currentChat.id;
        } else {
            body.receiver_id = currentChat.id;
        }

        const data = await apiCall('send', 'POST', body);
        messageElement.dataset.id = data.data.chat_id;

        showNotification('Message sent!');

        setTimeout(() => {
            if (messageElement.querySelector('.message-status')) {
                messageElement.querySelector('.message-status').innerHTML = `
                    <i class="fas fa-check-double"></i>
                    <span>Delivered</span>
                `;
                messageElement.querySelector('.message-status').className = 'message-status delivered';
            }
        }, 1000);

        setTimeout(() => {
            if (messageElement.querySelector('.message-status')) {
                messageElement.querySelector('.message-status').innerHTML = `
                    <i class="fas fa-check-double"></i>
                    <span>Seen</span>
                `;
                messageElement.querySelector('.message-status').className = 'message-status seen';
            }
        }, 3000);

    } catch (error) {
        messageElement.remove();
        showNotification('Failed to send message', 'error');
    }
}

// Poll for new messages
async function pollNewMessages() {
    if (!currentChat || !currentChat.lastMessageId) return;

    try {
        const data = await apiCall(
            `messages?type=${currentChat.isGroup ? 'group' : 'private'}&chat_id=${currentChat.id}&after_id=${currentChat.lastMessageId}`
        );

        if (data.data.length > 0) {
            currentChat.lastMessageId = data.data[data.data.length - 1].chat_id;

            data.data.forEach(message => {
                messagesContainer.appendChild(createMessageElement(message));
            });

            const isNearBottom = messagesContainer.scrollHeight - messagesContainer.clientHeight <= messagesContainer.scrollTop + 100;
            if (isNearBottom) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            if (!document.querySelector(`.contact[data-id="${currentChat.id}"]`).classList.contains('active')) {
                const contactElement = document.querySelector(`.contact[data-id="${currentChat.id}"]`);
                let unreadCount = contactElement.querySelector('.unread-count');

                if (!unreadCount) {
                    unreadCount = document.createElement('div');
                    unreadCount.className = 'unread-count';
                    contactElement.querySelector('.contact-status').appendChild(unreadCount);
                }

                const currentCount = parseInt(unreadCount.textContent) || 0;
                unreadCount.textContent = currentCount + data.data.length;
                unreadCount.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Polling error:', error);
    }
}

// Escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Show notification
function showNotification(message, type = 'success') {
    notificationText.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Set up event listeners
function setupEventListeners() {
    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    messageInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    contactSearch.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        document.querySelectorAll('.contact').forEach(contact => {
            const name = contact.querySelector('h4').textContent.toLowerCase();
            const role = contact.querySelector('p').textContent.toLowerCase();
            if (name.includes(searchTerm) || role.includes(searchTerm)) {
                contact.style.display = 'flex';
            } else {
                contact.style.display = 'none';
            }
        });
    });

    toggleContacts.addEventListener('click', function () {
        contactsSidebar.classList.toggle('active');
    });

    emojiBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        emojiPickerContainer.classList.toggle('active');
    });

    window.addEventListener('click', function () {
        emojiPickerContainer.classList.remove('active');
    });

    window.addEventListener('online', () => showNotification('Back online', 'success'));
    window.addEventListener('offline', () => showNotification('You are offline', 'warning'));
}

// Initialize app
window.addEventListener('DOMContentLoaded', initApp);