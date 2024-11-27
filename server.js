const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;

// Initialize Express app first
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Initialize bot after server is running
let bot = null;

// Start server first
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Initialize bot after server is running
    bot = new TelegramBot(token, {
        webHook: {
            port: PORT
        }
    });

    // Set webhook
    const url = 'https://niu-niu-game.onrender.com';
    try {
        await bot.setWebHook(`${url}/bot${token}`);
        console.log('Webhook set successfully');
        
        // Add webhook handler
        app.post(`/bot${token}`, (req, res) => {
            bot.handleUpdate(req.body);
            res.sendStatus(200);
        });

        // Set up bot commands
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

        bot.on('webhook_error', (error) => {
            console.log('Webhook Error:', error.code);
        });

    } catch (err) {
        console.error('Error setting webhook:', err);
    }
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
        server.close();
        app.listen(PORT + 1);
    } else {
        console.error('Server error:', err);
    }
});

// Rest of your routes... 