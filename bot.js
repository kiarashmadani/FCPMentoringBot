, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

const messageMap = new Map();

bot.on('message', async (msg) => {

    if (msg.chat.id === GROUP_ID) {

        if (msg.reply_to_message && msg.text) {

            const repliedMessageId = msg.reply_to_message.message_id;

            const customerId = messageMap.get(repliedMessageId);

            if (customerId) {
                await bot.sendMessage(customerId, msg.text);
            }
        }

        return;
    }

    try {
        const sentMessage = await bot.forwardMessage(
            GROUP_ID,
            msg.chat.id,
            msg.message_id
        );

        messageMap.set(sentMessage.message_id, msg.chat.id);

    } catch (err) {
        console.log(err);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Support bot running...");
});
