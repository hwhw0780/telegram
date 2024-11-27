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
        enterRoom(username);
    }
    window.location.href = 'niuniu.html' + (username ? `?user=${username}` : '');
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