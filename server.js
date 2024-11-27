const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;

// Update the bot initialization and port handling
const PORT = process.env.PORT || 3001;

// Initialize bot with webhook
const bot = new TelegramBot(token, {
    webHook: {
        port: PORT
    }
});

// Initialize Express app
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

// Move the webhook setup after all routes
const url = 'https://niu-niu-game.onrender.com';
bot.setWebHook(`${url}/bot${token}`)
    .then(() => {
        console.log('Webhook set successfully');
    })
    .catch(err => {
        console.error('Error setting webhook:', err);
    });

// Start server with error handling
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
        server.listen(PORT + 1);
    } else {
        console.error('Server error:', err);
    }
}); 