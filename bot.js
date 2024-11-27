require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not set!');
    process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(token, {
    webHook: {
        port: process.env.BOT_PORT || 8443
    }
});

// Set webhook
const url = 'https://niu-niu-game.onrender.com';
bot.setWebHook(`${url}/bot${token}`)
    .then(() => {
        console.log('Webhook set successfully');
    })
    .catch(err => {
        console.error('Error setting webhook:', err);
    });

// Bot commands
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;

    if (!username) {
        bot.sendMessage(chatId, "Please set a username in your Telegram settings first!");
        return;
    }

    bot.sendMessage(chatId, `Welcome ${username}! Click here to play: ${url}?user=${username}`);
});

// Error handling
bot.on('error', (error) => {
    console.error('Bot error:', error);
});

bot.on('webhook_error', (error) => {
    console.error('Webhook error:', error);
});

console.log('Bot service started');

module.exports = bot; 