document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');

    if (!username) {
        // If no username, redirect back to main page
        window.location.href = '/';
        return;
    }

    await loadUserData(username);
    // Update user data every 5 seconds
    setInterval(() => loadUserData(username), 5000);
});

async function loadUserData(username) {
    try {
        const response = await fetch(`/api/user/${username}`);
        const userData = await response.json();
        
        // Update header info
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