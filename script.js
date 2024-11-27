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

class NiuNiuGame {
    constructor() {
        this.gameState = 'waiting'; // waiting, bidding, betting, dealing
        this.currentBanker = null;
        this.highestBid = 0;
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.statusText = document.getElementById('statusText');
        this.countdown = document.getElementById('countdown');
        this.bidBtn = document.querySelector('.bid-btn');
        this.betBtn = document.querySelector('.bet-btn');
        this.inputModal = document.getElementById('inputModal');
        this.amountInput = document.getElementById('amountInput');
        this.redPacketModal = document.getElementById('redPacketModal');
    }

    initializeEventListeners() {
        this.bidBtn.addEventListener('click', () => this.showBidModal());
        this.betBtn.addEventListener('click', () => this.showBetModal());
        document.getElementById('confirmAmount').addEventListener('click', () => this.handleAmountConfirm());
    }

    startBiddingPhase() {
        this.gameState = 'bidding';
        this.statusText.textContent = 'Banker Bidding Phase';
        this.bidBtn.disabled = false;
        this.startCountdown(10, () => this.finalizeBanker());
    }

    startBettingPhase() {
        this.gameState = 'betting';
        this.statusText.textContent = 'Betting Phase';
        this.betBtn.disabled = false;
        this.startCountdown(20, () => this.finalizeBetting());
    }

    showBidModal() {
        this.inputModal.classList.remove('hidden');
        document.getElementById('modalTitle').textContent = 'Enter Bid Amount';
    }

    showBetModal() {
        this.inputModal.classList.remove('hidden');
        document.getElementById('modalTitle').textContent = 'Enter Bet Amount';
    }

    handleAmountConfirm() {
        const amount = parseInt(this.amountInput.value);
        if (!amount || isNaN(amount)) {
            alert('Please enter a valid amount');
            return;
        }

        if (this.gameState === 'bidding') {
            this.handleBankerBid(amount);
        } else if (this.gameState === 'betting') {
            this.handlePlayerBet(amount);
        }

        this.inputModal.classList.add('hidden');
        this.amountInput.value = '';
    }

    startCountdown(seconds, callback) {
        let timeLeft = seconds;
        this.countdown.textContent = timeLeft;
        
        const timer = setInterval(() => {
            timeLeft--;
            this.countdown.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                callback();
            }
        }, 1000);
    }

    // ... Add more game logic methods as needed
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new NiuNiuGame();
    window.game = game; // For debugging
});