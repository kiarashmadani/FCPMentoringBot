// ذخیره وضعیت پاسخ داده شده
const repliedTickets = new Set();

bot.on('message', async (msg) => {

    // اگر پیام از گروه اپراتورهاست
    if (msg.chat.id === GROUP_ID) {

        if (msg.reply_to_message && msg.text) {

            const repliedMessageId = msg.reply_to_message.message_id;

            // ❌ اگر قبلاً جواب داده شده
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

                // 🔒 قفل کردن تیکت
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

    // پیام مشتری
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
