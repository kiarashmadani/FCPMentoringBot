const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.TOKEN;
const url = process.env.RENDER_EXTERNAL_URL;

const bot = new TelegramBot(token);
const app = express();

app.use(express.json());

bot.setWebHook(`${url}/bot${token}`);

app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

bot.on('message', (msg) => {
    console.log(msg.chat.id);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running...");
});
