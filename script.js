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
 