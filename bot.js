const TelegramBot = require('node-telegram-bot-api');

const token = '8396112909:AAFj7U1FhMSkYR6lquaPBvhVOCovtIpSfts';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    console.log(msg.chat.id);
});