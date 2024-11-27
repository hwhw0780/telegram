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
        this.gameState = 'checking';
        this.currentBanker = null;
        this.highestBid = 0;
        this.bids = new Map();
        this.bets = new Map();
        this.initializeElements();
        this.initializeEventListeners();
        this.checkGameStatus();
    }

    async checkGameStatus() {
        try {
            const response = await fetch('/api/game/status');
            const status = await response.json();

            const playerCount = document.querySelector('.player-count');
            if (playerCount) {
                playerCount.textContent = `Online Players: ${status.onlinePlayers.length}`;
            }

            if (!status.isActive) {
                this.setGameState('waiting');
                const bottomActions = document.createElement('div');
                bottomActions.className = 'bottom-actions';
                bottomActions.innerHTML = `
                    <button class="bid-btn" onclick="game.startNewGame()">Bid Banker</button>
                `;
                document.querySelector('.game-area').appendChild(bottomActions);
            } else {
                this.gameState = status.phase;
                this.currentBanker = status.currentBanker;
                this.highestBid = status.highestBid;
                this.bids = new Map(status.bids);
                this.bets = new Map(status.bets);
                this.updateDisplay();
            }
        } catch (err) {
            console.error('Error checking game status:', err);
        }

        setTimeout(() => this.checkGameStatus(), 3000);
    }

    setGameState(state) {
        this.gameState = state;
        const bottomActions = document.querySelector('.bottom-actions');
        
        switch(state) {
            case 'checking':
                this.statusText.textContent = 'Checking game status...';
                break;
            case 'waiting':
                this.statusText.textContent = 'No active game - Click Bid Banker to start';
                break;
            case 'bidding':
                this.statusText.textContent = 'Banker Bidding Phase';
                this.bidBtn.disabled = false;
                this.betBtn.disabled = true;
                break;
            case 'betting':
                this.statusText.textContent = 'Betting Phase';
                this.bidBtn.disabled = true;
                this.betBtn.disabled = false;
                break;
            case 'dealing':
                this.statusText.textContent = 'Dealing Phase';
                this.bidBtn.disabled = true;
                this.betBtn.disabled = true;
                break;
        }
    }

    showBidBankerButton() {
        const bankerActions = document.createElement('div');
        bankerActions.className = 'banker-actions';
        bankerActions.innerHTML = `
            <button class="bid-btn" onclick="game.startNewGame()">Bid Banker</button>
        `;
        document.querySelector('.banker-box').appendChild(bankerActions);
    }

    async startNewGame() {
        try {
            const response = await fetch('/api/game/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const status = await response.json();
            this.setGameState('bidding');
            this.startBiddingPhase();
        } catch (err) {
            console.error('Error starting new game:', err);
        }
    }

    updateDisplay() {
        this.updateBankerDisplay();
        this.updatePlayersDisplay();
        this.setGameState(this.gameState);
    }

    initializeElements() {
        this.statusText = document.getElementById('statusText');
        this.countdown = document.getElementById('countdown');
        this.bidBtn = document.querySelector('.bid-btn');
        this.betBtn = document.querySelector('.bet-btn');
        this.inputModal = document.getElementById('inputModal');
        this.amountInput = document.getElementById('amountInput');
        this.redPacketModal = document.getElementById('redPacketModal');
        this.bankerTableBody = document.getElementById('bankerTableBody');
        this.playersTableBody = document.getElementById('playersTableBody');
    }

    initializeEventListeners() {
        this.bidBtn.addEventListener('click', () => this.showBidModal());
        this.betBtn.addEventListener('click', () => this.showBetModal());
        document.getElementById('confirmAmount').addEventListener('click', () => this.handleAmountConfirm());
    }

    async handleBankerBid(amount) {
        const username = this.getCurrentUsername();
        if (!username) return;

        if (amount <= this.highestBid) {
            alert('Bid must be higher than current highest bid: ' + this.highestBid);
            return;
        }

        this.bids.set(username, amount);
        this.highestBid = amount;
        this.currentBanker = username;
        
        this.updateBankerDisplay();
        
        this.startCountdown(10, () => this.finalizeBanker());
    }

    async handlePlayerBet(amount) {
        const username = this.getCurrentUsername();
        if (!username || username === this.currentBanker) return;

        this.bets.set(username, amount);
        this.updatePlayersDisplay();
    }

    finalizeBanker() {
        if (!this.currentBanker) {
            this.startGameLoop();
            return;
        }

        this.statusText.textContent = `${this.currentBanker} is the banker with ${this.highestBid} bid!`;
        setTimeout(() => this.startBettingPhase(), 3000);
    }

    startBettingPhase() {
        this.setGameState('betting');
        this.startCountdown(60, () => this.finalizeBetting());
    }

    finalizeBetting() {
        this.setGameState('dealing');
        if (this.getCurrentUsername() === this.currentBanker) {
            this.showDealButton();
        }
    }

    showDealButton() {
        const dealBtn = document.createElement('button');
        dealBtn.textContent = 'Deal Now';
        dealBtn.className = 'action-btn';
        dealBtn.onclick = () => this.dealCards();
        document.querySelector('.banker-actions').appendChild(dealBtn);
    }

    dealCards() {
        this.bets.forEach((bet, username) => {
            this.showRedPacketToPlayer(username);
        });
        this.showRedPacketToPlayer(this.currentBanker);
    }

    showRedPacketToPlayer(username) {
        if (username === this.getCurrentUsername()) {
            this.redPacketModal.classList.remove('hidden');
        }
    }

    getCurrentUsername() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('user');
    }

    updateBankerDisplay() {
        this.bankerTableBody.innerHTML = '';
        if (this.currentBanker) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.currentBanker}</td>
                <td>${this.highestBid}</td>
                <td>-</td>
            `;
            this.bankerTableBody.appendChild(row);
        }
    }

    updatePlayersDisplay() {
        this.playersTableBody.innerHTML = '';
        this.bets.forEach((bet, username) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${username}</td>
                <td>${bet}</td>
                <td>-</td>
            `;
            this.playersTableBody.appendChild(row);
        });
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

    // ... Add more game logic methods as needed
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new NiuNiuGame();
    window.game = game; // For debugging
});