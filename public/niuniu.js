document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');

    if (username) {
        await loadUserData(username);
        // Update points every 5 seconds
        setInterval(() => loadUserData(username), 5000);
    }
});

async function loadUserData(username) {
    try {
        const response = await fetch(`/api/user/${username}`);
        const userData = await response.json();
        
        document.querySelector('.username').textContent = userData.username;
        document.querySelector('.points').textContent = userData.points;
        
        return userData;
    } catch (err) {
        console.error('Error loading user data:', err);
    }
}

// Chat functionality
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (message) {
        addChatMessage(message);
        input.value = '';
    }
}

function addChatMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
} 