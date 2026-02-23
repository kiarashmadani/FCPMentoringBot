const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.TOKEN;
const url = process.env.RENDER_EXTERNAL_URL;

const GROUP_ID = -1003742359447;

const bot = new TelegramBot(token);
const app = express();

app.use(express.json());

bot.setWebHook(`${url}/bot${token}`);

app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

bot.on('message', async (msg) => {

    if (msg.chat.id === GROUP_ID) {

        if (msg.reply_to_message && msg.text) {

            const original = msg.reply_to_message;

            if (original.forward_from) {
                const customerId = original.forward_from.id;

                await bot.sendMessage(customerId, msg.text);
            }
        }

        return;
    }

    try {
        await bot.forwardMessage(
            GROUP_ID,
            msg.chat.id,
            msg.message_id
        );
    } catch (err) {
        console.log(err);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Support bot running...");
});
