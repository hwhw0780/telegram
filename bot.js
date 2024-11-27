const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;

// Initialize bot
const bot = new TelegramBot(token, {
    webHook: {
        port: process.env.BOT_PORT || 8443
    }
});

// Set webhook
const url = 'https://niu-niu-game.onrender.com';
bot.setWebHook(`${url}/bot${token}`);

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

module.exports = bot; 