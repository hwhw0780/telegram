document.addEventListener('DOMContentLoaded', async () => {
    // Get username from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');

    if (username) {
        try {
            // Load user data
            const userData = await loadUserData(username);
            if (userData) {
                updateUsername(userData.username);
                updatePoints(userData.points);
            }
        } catch (err) {
            console.error('Error loading user data:', err);
        }
    }
});

function enterNiuNiu() {
    window.location.href = 'niuniu.html';
}

// Update user data with animation
function updatePoints(points) {
    const pointsElement = document.querySelector('.points');
    pointsElement.style.transform = 'scale(1.2)';
    pointsElement.textContent = points;
    
    setTimeout(() => {
        pointsElement.style.transform = 'scale(1)';
    }, 200);
}

function updateUsername(username) {
    document.querySelector('.username').textContent = username;
}

// Add online players counter animation
let playerCount = 28;
setInterval(() => {
    const randomChange = Math.random() > 0.5 ? 1 : -1;
    playerCount = Math.max(15, Math.min(50, playerCount + randomChange));
    document.querySelector('.room-status').textContent = `Online Players: ${playerCount}`;
}, 5000);

async function loadUserData(username) {
    try {
        const response = await fetch(`/api/user/${username}`);
        const userData = await response.json();
        
        // Update UI with user data
        document.querySelector('.username').textContent = userData.username;
        document.querySelector('.points').textContent = userData.points;
        
        return userData;
    } catch (err) {
        console.error('Error loading user data:', err);
    }
}

async function updateTransaction(username, type, amount) {
    try {
        const response = await fetch('/api/transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, type, amount })
        });
        
        const userData = await response.json();
        document.querySelector('.points').textContent = userData.points;
    } catch (err) {
        console.error('Error updating transaction:', err);
    }
}

async function updateGameHistory(username, type, amount, result) {
    try {
        await fetch('/api/game-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, type, amount, result })
        });
    } catch (err) {
        console.error('Error updating game history:', err);
    }
}
 