
const token = '8396112909:AAFj7U1FhMSkYR6lquaPBvhVOCovtIpSfts';
const TelegramBot = require('node-telegram-bot-api');
const { HttpsProxyAgent } = require('https-proxy-agent'); // 👈 این مهمه

const proxy = 'http://127.0.0.1:7890'; // پورت پراکسی‌ات

const agent = new HttpsProxyAgent(proxy);

const bot = new TelegramBot(token, {
    polling: true,
    request: {
        agent: agent
    }
});

bot.on('message', (msg) => {
    console.log(msg.chat.id);
});