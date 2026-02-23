const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send("Bot is running 🚀");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TOKEN;
const GROUP_ID = -1003742359447; // آیدی گروه پشتیبان‌ها

const bot = new TelegramBot(token, { polling: true });

// مپ‌ها
const groupToCustomerMap = new Map();
const customerToGroupMap = new Map();

// جلوگیری از پاسخ همزمان
const repliedTickets = new Set();


// =============================
// 📩 پیام جدید مشتری
// =============================
bot.on('message', async (msg) => {

    // اگر پیام از گروه اپراتورهاست
    if (msg.chat.id === GROUP_ID) {

        if (msg.reply_to_message && msg.text) {

            const repliedMessageId = msg.reply_to_message.message_id;

            // اگر قبلاً پاسخ داده شده
            if (repliedTickets.has(repliedMessageId)) {
                await bot.sendMessage(
                    GROUP_ID,
                    "⛔ این پیام قبلاً پاسخ داده شده.",
                    { reply_to_message_id: msg.message_id }
                );
                return;
            }

            const customerId = groupToCustomerMap.get(repliedMessageId);

            if (customerId) {

                // قفل کردن
                repliedTickets.add(repliedMessageId);

                await bot.sendMessage(customerId, msg.text);

                await bot.sendMessage(
                    GROUP_ID,
                    "✅ پاسخ ارسال شد.",
                    { reply_to_message_id: msg.message_id }
                );
            }
        }

        return;
    }

    // اگر پیام از مشتریه
    try {

        const sentMessage = await bot.forwardMessage(
            GROUP_ID,
            msg.chat.id,
            msg.message_id
        );

        groupToCustomerMap.set(sentMessage.message_id, msg.chat.id);
        customerToGroupMap.set(msg.message_id, sentMessage.message_id);

    } catch (err) {
        console.log(err);
    }
});


// =============================
// ✏ ادیت پیام مشتری
// =============================
bot.on('edited_message', async (msg) => {

    const groupMessageId = customerToGroupMap.get(msg.message_id);

    if (groupMessageId) {
        try {
            await bot.editMessageText(
                `✏ پیام ویرایش شد:\n\n${msg.text}`,
                {
                    chat_id: GROUP_ID,
                    message_id: groupMessageId
                }
            );
        } catch (err) {
            console.log("Edit Error:", err.message);
        }
    }
});


// =============================
// 🗑 حذف پیام مشتری
// =============================
bot.on('message', async (msg) => {

    if (msg.delete_chat_photo) return;

});

bot.on('message_deleted', async (msg) => {

    const groupMessageId = customerToGroupMap.get(msg.message_id);

    if (groupMessageId) {
        try {
            await bot.deleteMessage(GROUP_ID, groupMessageId);
        } catch (err) {
            console.log("Delete Error:", err.message);
        }
    }
});
