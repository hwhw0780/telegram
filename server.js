const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    points: { type: Number, default: 0 },
    agent: String,
    telegramId: String,
    gameHistory: [{
        type: { type: String },
        amount: Number,
        result: String,
        timestamp: { type: Date, default: Date.now }
    }],
    transactions: [{
        type: String,
        amount: Number,
        timestamp: { type: Date, default: Date.now }
    }]
});

const User = mongoose.model('User', userSchema);

// Game status
let gameStatus = {
    isActive: false,
    phase: 'waiting',
    currentBanker: null,
    highestBid: 0,
    bids: new Map(),
    bets: new Map(),
    startTime: null,
    onlinePlayers: new Set()
};

// API Routes
app.get('/api/user/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            user = new User({ username });
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Game routes
app.get('/api/game/status', (req, res) => {
    res.json({
        ...gameStatus,
        onlinePlayers: Array.from(gameStatus.onlinePlayers),
        bids: Array.from(gameStatus.bids.entries()),
        bets: Array.from(gameStatus.bets.entries())
    });
});

app.post('/api/room/enter', async (req, res) => {
    const { username } = req.body;
    if (username) {
        gameStatus.onlinePlayers.add(username);
        console.log('Player entered:', username, 'Total players:', gameStatus.onlinePlayers.size);
    }
    res.json({ 
        count: gameStatus.onlinePlayers.size,
        players: Array.from(gameStatus.onlinePlayers)
    });
});

app.post('/api/room/leave', async (req, res) => {
    const { username } = req.body;
    if (username) {
        gameStatus.onlinePlayers.delete(username);
        console.log('Player left:', username, 'Total players:', gameStatus.onlinePlayers.size);
    }
    res.json({ 
        count: gameStatus.onlinePlayers.size,
        players: Array.from(gameStatus.onlinePlayers)
    });
});

// Admin routes
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
