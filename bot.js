const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TOKEN;
const GROUP_ID = -1003742359447;

const bot = new TelegramBot(token, { polling: true });

// ==============================
// حافظه موقت
// ==============================
const groupToCustomerMap = new Map();
const customerToGroupMap = new Map();


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
            // ارسال هر نوع پیام (متن، عکس، ویس، فایل، ...)
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
        await bot.copyMessage(
            GROUP_ID,
            msg.chat.id,
            msg.message_id,
            { reply_to_message_id: groupMessageId }
        );

        await bot.sendMessage(
            GROUP_ID,
            "✏ کاربر پیامش را ویرایش کرد.",
            { reply_to_message_id: groupMessageId }
        );

    } catch (err) {
        console.log("Edit error:", err.message);
    }
});

console.log("🤖 Bot is running...");
