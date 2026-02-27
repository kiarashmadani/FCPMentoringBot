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
const groupToCustomerMap = new Map();      // پیام گروه → آیدی مشتری
const customerToGroupMap = new Map();      // پیام مشتری → پیام گروه
const operatorToCustomerMap = new Map();   // پیام اپراتور → پیام مشتری

// ==============================
// Webhook endpoint
// ==============================
app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// تنظیم webhook
bot.setWebHook(`${url}/bot${token}`);


// ==============================
// مدیریت پیام جدید
// ==============================
bot.on('message', async (msg) => {

    // =========================
    // اگر پیام داخل گروه اپراتورهاست
    // =========================
    if (msg.chat.id === GROUP_ID) {

        if (!msg.reply_to_message) return;

        const groupMessageId = msg.reply_to_message.message_id;
        const customerId = groupToCustomerMap.get(groupMessageId);

        if (!customerId) return;

        try {
            const sent = await bot.copyMessage(
                customerId,
                GROUP_ID,
                msg.message_id
            );

            operatorToCustomerMap.set(msg.message_id, {
                customerId: customerId,
                customerMessageId: sent.message_id
            });

        } catch (err) {
            console.log("Operator send error:", err.message);
        }

        return;
    }

    // =========================
    // اگر پیام از مشتری است
    // =========================
    if (msg.chat.id !== GROUP_ID) {

    try {
        await bot.request('setMessageReaction', {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            reaction_type: '👍'
        });
    } catch (err) {
        console.log("Add reaction error:", err.message);
    }
        
        const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
        const username = msg.from.username ? `@${msg.from.username}` : '';
        const header = `👤 ${fullName} ${username}\n──────────────────\n`;

        try {

            // اگر پیام متنی است
            if (msg.text) {

                const sentMessage = await bot.sendMessage(
                    GROUP_ID,
                    header + msg.text
                );

                groupToCustomerMap.set(sentMessage.message_id, msg.chat.id);
                customerToGroupMap.set(msg.message_id, sentMessage.message_id);

            }
            // اگر مدیا است
            else {

                const sentMessage = await bot.copyMessage(
                    GROUP_ID,
                    msg.chat.id,
                    msg.message_id,
                    {
                        caption: header + (msg.caption || '')
                    }
                );

                groupToCustomerMap.set(sentMessage.message_id, msg.chat.id);
                customerToGroupMap.set(msg.message_id, sentMessage.message_id);
            }

        } catch (err) {
            console.log("Customer send error:", err.message);
        }
    }

});


// ==============================
// ادیت پیام‌ها
// ==============================
bot.on('edited_message', async (msg) => {

    // =========================
    // ادیت مشتری
    // =========================
    if (msg.chat.id !== GROUP_ID) {

        const groupMessageId = customerToGroupMap.get(msg.message_id);
        if (!groupMessageId) return;

        try {
            if (msg.text) {
                await bot.editMessageText(msg.text, {
                    chat_id: GROUP_ID,
                    message_id: groupMessageId
                });
            } else if (msg.caption) {
                await bot.editMessageCaption(msg.caption, {
                    chat_id: GROUP_ID,
                    message_id: groupMessageId
                });
            }
        } catch (err) {
            console.log("Customer edit error:", err.message);
        }
    }

    // =========================
    // ادیت اپراتور
    // =========================
    else {

        const data = operatorToCustomerMap.get(msg.message_id);
        if (!data) return;

        try {
            if (msg.text) {
                await bot.editMessageText(msg.text, {
                    chat_id: data.customerId,
                    message_id: data.customerMessageId
                });
            } else if (msg.caption) {
                await bot.editMessageCaption(msg.caption, {
                    chat_id: data.customerId,
                    message_id: data.customerMessageId
                });
            }
        } catch (err) {
            console.log("Operator edit error:", err.message);
        }
    }

});


// ==============================
// اجرای سرور
// ==============================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
