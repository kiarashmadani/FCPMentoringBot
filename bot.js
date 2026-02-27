const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.TOKEN;
const url = process.env.RENDER_EXTERNAL_URL;

const GROUP_ID = -1003742359447;
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(token);
const app = express();

app.use(express.json());

// ==============================
// حافظه موقت
// ==============================
const groupToCustomerMap = new Map();
const customerToGroupMap = new Map();

// ==============================
// Webhook endpoint
// ==============================
app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// ==============================
// تنظیم Webhook
// ==============================
bot.setWebHook(`${url}/bot${token}`);


// ==============================
// مدیریت پیام‌ها
// ==============================
bot.on('message', async (msg) => {

    // =========================
    // اگر پیام داخل گروه است (اپراتورها)
    // =========================
    if (msg.chat.id === GROUP_ID) {

        if (!msg.reply_to_message) return;

        const groupMessageId = msg.reply_to_message.message_id;
        const customerId = groupToCustomerMap.get(groupMessageId);

        if (!customerId) return;

        try {
            await bot.copyMessage(
                customerId,
                GROUP_ID,
                msg.message_id
            );
        } catch (err) {
            console.log("Send error:", err.message);
        }

        return;
    }

    // =========================
    // اگر پیام از مشتری است
    // =========================
    if (msg.chat.id !== GROUP_ID) {

        try {
            const sentMessage = await bot.copyMessage(
                GROUP_ID,
                msg.chat.id,
                msg.message_id
            );

            groupToCustomerMap.set(sentMessage.message_id, msg.chat.id);
            customerToGroupMap.set(msg.message_id, sentMessage.message_id);

        } catch (err) {
            console.log("Copy error:", err.message);
        }
    }

});


// ==============================
// ادیت پیام مشتری
// ==============================
bot.on('edited_message', async (msg) => {

    const groupMessageId = customerToGroupMap.get(msg.message_id);
    if (!groupMessageId) return;

    try {

        if (msg.text) {

            await bot.editMessageText(
                msg.text,
                {
                    chat_id: GROUP_ID,
                    message_id: groupMessageId
                }
            );

        } else if (msg.caption) {

            await bot.editMessageCaption(
                msg.caption,
                {
                    chat_id: GROUP_ID,
                    message_id: groupMessageId
                }
            );

        }

    } catch (err) {
        console.log("Edit error:", err.message);
    }

});


// ==============================
// اجرای سرور
// ==============================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
