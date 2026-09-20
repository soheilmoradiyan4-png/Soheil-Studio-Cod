// =========================================
// پیدا کردن chat_id برای ربات بله
// =========================================
//
// 1) ربات را در بله باز کنید و یک پیام (مثلاً /start) برایش بفرستید
// 2) این دستور را اجرا کنید:  npm run bale:chat-id
// 3) عدد id را در BALE_ADMIN_CHAT_IDS داخل .env بگذارید

const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../../.env")
});

const { getBotInfo, getRecentChats } = require("../services/bale");

(async () => {

    try {

        const bot = await getBotInfo();

        console.log(
            `✅ ربات متصل است: ${bot.first_name || ""} ` +
            `(@${bot.username || "?"})\n`
        );

        const chats = await getRecentChats();

        if (chats.length === 0) {

            console.log(
                "هنوز پیامی برای ربات نیامده.\n" +
                "اول در بله به ربات یک پیام بدهید و دوباره اجرا کنید."
            );

            return;

        }

        console.log("چت‌های پیدا شده:");

        for (const chat of chats) {

            console.log(
                `  id: ${chat.id}  |  ${chat.name || "-"}` +
                `  |  @${chat.username || "-"}  |  ${chat.type}`
            );

        }

        console.log(
            "\nمقدار id را در .env قرار دهید:\n" +
            "BALE_ADMIN_CHAT_IDS=<id>"
        );

    } catch (error) {

        console.error("❌", error.message);

        process.exitCode = 1;

    }

})();
