const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TOKEN;
const GROUP_ID = -1003742359447; // آیدی گروه پشتیبانی

const bot = new TelegramBot(token, { polling: true });

// ==============================
// 📦 حافظه موقت
// ==============================

// پیام گروه → آیدی مشتری
const groupToCustomerMap = new Map();

// پیام مشتری → پیام گروه
const customerToGroupMap = new Map();

// مالک هر تیکت
const ticketOwners = new Map();


// ==============================
// 📩 مدیریت پیام‌ها
// ==============================
bot.on('message', async (msg) => {

    // =====================================
    // 🟣 اگر پیام داخل گروه اپراتورهاست
    // =====================================
    if (msg.chat.id === GROUP_ID) {

        if (!msg.reply_to_message || !msg.text) return;

        const groupMessageId = msg.reply_to_message.message_id;
        const operatorId = msg.from.id;
        const operatorName = msg.from.first_name;

        const customerId = groupToCustomerMap.get(groupMessageId);
        if (!customerId) return;

        const currentOwner = ticketOwners.get(groupMessageId);

        // 🟢 اگر هنوز کسی مالک نشده
        if (!currentOwner) {
            ticketOwners.set(groupMessageId, operatorId);

            await bot.sendMessage(
                GROUP_ID,
                `🔒 این تیکت توسط ${operatorName} گرفته شد.`,
                { reply_to_message_id: groupMessageId }
            );
        }

        // 🔴 اگر مالک هست ولی این اپراتور نیست
        else if (currentOwner !== operatorId) {
            await bot.sendMessage(
                GROUP_ID,
                "⛔ این تیکت در اختیار اپراتور دیگری است.",
                { reply_to_message_id: msg.message_id }
            );
            return;
        }

        // ✅ ارسال پیام به مشتری
        try {
            await bot.sendMessage(customerId, msg.text);
        } catch (err) {
            console.log("Send to customer error:", err.message);
        }

        return;
    }


    // =====================================
    // 🟢 اگر پیام از مشتری است
    // =====================================
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
// ✏ ادیت پیام مشتری
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


// ==============================
// 🚀 لاگ اجرای ربات
// ==============================
console.log("🤖 Bot is running...");
