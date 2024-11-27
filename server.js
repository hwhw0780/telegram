const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, {
    polling: {
        autoStart: true,
        params: {
            timeout: 10,
            allowed_updates: ["message"]
        }
    },
    webHook: false
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Add this before your routes
app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Create User Schema
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

// API Routes
app.post('/api/user', async (req, res) => {
    try {
        const { username } = req.body;
        let user = await User.findOne({ username });
        
        if (!user) {
            user = new User({ username });
            await user.save();
        }
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/user/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/transaction', async (req, res) => {
    try {
        const { username, type, amount } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        user.transactions.push({ type, amount });
        user.points += amount;
        await user.save();
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/game-history', async (req, res) => {
    try {
        const { username, type, amount, result } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        user.gameHistory.push({ type, amount, result });
        await user.save();
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Telegram bot commands
bot.onText(/\/start/, async (msg) => {
    console.log('Received /start command', msg);
    const chatId = msg.chat.id;
    const username = msg.from.username;

    console.log('ChatID:', chatId, 'Username:', username);

    if (!username) {
        bot.sendMessage(chatId, "Please set a username in your Telegram settings first!");
        return;
    }

    try {
        // Check if user exists
        let user = await User.findOne({ username });
        console.log('Found user:', user);
        
        if (!user) {
            // Create new user if doesn't exist
            user = new User({ 
                username,
                points: 0,
                telegramId: chatId
            });
            await user.save();
            console.log('Created new user:', user);
            bot.sendMessage(chatId, `Welcome ${username}! Your account has been created.`);
        } else {
            bot.sendMessage(chatId, `Welcome back ${username}! Your current points: ${user.points}`);
        }

        // Send game link (update this URL to your actual domain)
        bot.sendMessage(chatId, `Click here to play: https://niu-niu-game.onrender.com?user=${username}`);

    } catch (err) {
        console.error('Error handling /start command:', err);
        bot.sendMessage(chatId, "Sorry, there was an error. Please try again later.");
    }
});

// Add error handler for the bot
bot.on('error', (error) => {
    console.log('Telegram Bot Error:', error);
});

// Add polling error handler
bot.on('polling_error', (error) => {
    console.log('Polling Error:', error);
    if (error.code === 'ETELEGRAM' && error.response.statusCode === 409) {
        console.log('Conflict detected, restarting bot...');
        bot.stopPolling()
            .then(() => {
                return new Promise(resolve => setTimeout(resolve, 1000));
            })
            .then(() => bot.startPolling());
    }
});

// Add this to see if bot is receiving messages
bot.on('message', (msg) => {
    console.log('Received message:', msg);
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/niuniu', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'niuniu.html'));
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

app.delete('/api/admin/users/:username', async (req, res) => {
    try {
        await User.findOneAndDelete({ username: req.params.username });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add route for admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin authentication
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/admin/users/:username/points', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        user.points += req.body.amount;
        await user.save();
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/users/:username/agent', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        user.agent = req.body.agent;
        await user.save();
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add at the top of server.js with other declarations
const onlinePlayers = new Set(); // Store online player usernames

// Add these new routes
app.post('/api/room/enter', async (req, res) => {
    const { username } = req.body;
    onlinePlayers.add(username);
    console.log('Player entered:', username, 'Total players:', onlinePlayers.size);
    res.json({ count: onlinePlayers.size });
});

app.post('/api/room/leave', async (req, res) => {
    const { username } = req.body;
    onlinePlayers.delete(username);
    console.log('Player left:', username, 'Total players:', onlinePlayers.size);
    res.json({ count: onlinePlayers.size });
});

app.get('/api/room/count', (req, res) => {
    res.json({ count: onlinePlayers.size });
});

// Add this with other admin routes
app.post('/api/admin/reset-points', async (req, res) => {
    try {
        // Update all users' points to 0 instead of 1000
        await User.updateMany({}, { points: 0 });
        res.json({ message: 'All points reset successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 