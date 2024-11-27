async function enterRoom(username) {
    try {
        const response = await fetch('/api/room/enter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        const data = await response.json();
        updatePlayerCount(data.count);
    } catch (err) {
        console.error('Error entering room:', err);
    }
}

async function leaveRoom(username) {
    try {
        await fetch('/api/room/leave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
    } catch (err) {
        console.error('Error leaving room:', err);
    }
}

async function updatePlayerCount() {
    try {
        const response = await fetch('/api/room/count');
        const data = await response.json();
        document.querySelector('.room-status').textContent = `Online Players: ${data.count}`;
    } catch (err) {
        console.error('Error updating player count:', err);
    }
}

function enterNiuNiu() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    if (username) {
        window.location.href = `niuniu.html?user=${username}`;
    } else {
        window.location.href = 'niuniu.html';
    }
}

window.addEventListener('beforeunload', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    if (username) {
        leaveRoom(username);
    }
});

setInterval(updatePlayerCount, 5000);
updatePlayerCount();

function showGameRoom() {
    document.getElementById('lobbySection').classList.add('hidden');
    document.getElementById('gameSection').classList.remove('hidden');
    
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    if (username) {
        enterRoom(username);
    }
}

function enterRoom(username) {
    try {
        fetch('/api/room/enter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
    } catch (err) {
        console.error('Error entering room:', err);
    }
}

// Load user data on page load
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');

    if (!username) {
        window.location.href = '/';
        return;
    }

    await loadUserData(username);
    setInterval(() => loadUserData(username), 5000);
});