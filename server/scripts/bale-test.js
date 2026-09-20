// =========================================
// ارسال پیام آزمایشی به ربات بله
// اجرا:  npm run bale:test
// =========================================

const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../../.env")
});

const { getBotInfo, notifyAdmins } = require("../services/bale");

(async () => {

    try {

        const bot = await getBotInfo();

        console.log(
            `✅ توکن معتبر است: @${bot.username || "?"}`
        );

        const { sent, failed } = await notifyAdmins(
            "✅ پیام آزمایشی Soheil Studio Coding\n" +
            "اتصال سایت به ربات بله برقرار است."
        );

        console.log(`ارسال موفق: ${sent} | ناموفق: ${failed}`);

        if (failed > 0 || sent === 0) {
            process.exitCode = 1;
        }

    } catch (error) {

        console.error("❌", error.message);

        process.exitCode = 1;

    }

})();
