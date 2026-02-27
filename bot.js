const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TOKEN;
const GROUP_ID = -1003742359447;

const bot = new TelegramBot(token);

// ==============================
// حافظه موقت
// ==============================
const groupToCustomerMap = new Map();
const customerToGroupMap = new Map();


// ==============================
// پیام جدید
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
// ادیت پیام مشتری (نسخه حرفه‌ای)
// ==============================
bot.on('edited_message', async (msg) => {

    const groupMessageId = customerToGroupMap.get(msg.message_id);
    if (!groupMessageId) return;

    try {

        // اگر پیام متنی است
        if (msg.text) {

            await bot.editMessageText(
                msg.text,
                {
                    chat_id: GROUP_ID,
                    message_id: groupMessageId
                }
            );

        }
        // اگر مدیا با کپشن است
        else if (msg.caption) {

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

console.log("🤖 Bot is running...");
