// =========================================
// Bale Bot Service
// ارسال اعلان به ربات بله
// =========================================
//
// متغیرهای لازم در فایل .env:
//   BALE_BOT_TOKEN       توکن ربات (از botfather@ در بله)
//   BALE_ADMIN_CHAT_IDS  شناسه چت مدیرها، با کاما جدا شود (مثلاً 123456,789012)
//
// اگر این دو مقدار تنظیم نشده باشند، سرور بدون خطا کار می‌کند
// و فقط اعلان بله ارسال نمی‌شود.

const BALE_API_BASE = "https://tapi.bale.ai/bot";
const REQUEST_TIMEOUT_MS = 10000;
const MAX_MESSAGE_LENGTH = 3500;
const MAX_FIELD_LENGTH = 1000;


// -----------------------------------------
// Helpers
// -----------------------------------------

function getConfig() {

    const token = (process.env.BALE_BOT_TOKEN || "").trim();

    const chatIds = (process.env.BALE_ADMIN_CHAT_IDS || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

    return { token, chatIds };

}

// توکن هیچ‌وقت نباید داخل لاگ‌ها بیفتد
function maskToken(text, token) {

    if (!token) return String(text);

    return String(text).split(token).join("***");

}

function truncate(value, max) {

    const text = String(value ?? "").trim();

    return text.length > max
        ? text.slice(0, max) + "…"
        : text;

}

function normalizeChatId(chatId) {

    return /^-?\d+$/.test(chatId)
        ? Number(chatId)
        : chatId;

}

function formatNow() {

    return new Date().toLocaleString("fa-IR", {
        timeZone: "Asia/Tehran"
    });

}


// -----------------------------------------
// Low-level API call
// -----------------------------------------

async function callBale(token, method, payload) {

    const controller = new AbortController();

    const timer = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS
    );

    try {

        const response = await fetch(
            `${BALE_API_BASE}${token}/${method}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload || {}),

                signal: controller.signal
            }
        );

        const body = await response.json().catch(() => null);

        if (!response.ok || !body || body.ok === false) {

            const reason =
                (body && body.description) ||
                `HTTP ${response.status}`;

            throw new Error(`Bale ${method} failed: ${reason}`);

        }

        return body.result;

    } finally {

        clearTimeout(timer);

    }

}


// -----------------------------------------
// Public API
// -----------------------------------------

async function getBotInfo() {

    const { token } = getConfig();

    if (!token) {
        throw new Error("BALE_BOT_TOKEN در فایل .env تنظیم نشده است.");
    }

    return callBale(token, "getMe");

}

async function getRecentChats() {

    const { token } = getConfig();

    if (!token) {
        throw new Error("BALE_BOT_TOKEN در فایل .env تنظیم نشده است.");
    }

    const updates = await callBale(token, "getUpdates");

    const chats = new Map();

    for (const update of updates || []) {

        const message = update.message || update.edited_message;

        if (!message || !message.chat) continue;

        const chat = message.chat;

        chats.set(chat.id, {
            id: chat.id,
            type: chat.type,
            name: [chat.first_name, chat.last_name]
                .filter(Boolean)
                .join(" ") || chat.title || "",
            username: chat.username || ""
        });

    }

    return [...chats.values()];

}

// ارسال پیام به همه مدیرها. هیچ‌وقت throw نمی‌کند،
// تا خطای بله باعث شکست ثبت درخواست کاربر نشود.
async function notifyAdmins(text) {

    const { token, chatIds } = getConfig();

    if (!token || chatIds.length === 0) {

        console.warn(
            "⚠️ Bale notification skipped: " +
            "BALE_BOT_TOKEN یا BALE_ADMIN_CHAT_IDS تنظیم نشده."
        );

        return { sent: 0, failed: 0 };

    }

    const message = truncate(text, MAX_MESSAGE_LENGTH);

    const results = await Promise.allSettled(
        chatIds.map((chatId) =>
            callBale(token, "sendMessage", {
                chat_id: normalizeChatId(chatId),
                text: message
            })
        )
    );

    let sent = 0;
    let failed = 0;

    results.forEach((result, index) => {

        if (result.status === "fulfilled") {

            sent++;

        } else {

            failed++;

            const reason =
                result.reason && result.reason.message
                    ? result.reason.message
                    : result.reason;

            console.error(
                `❌ Bale notification failed (chat ${chatIds[index]}):`,
                maskToken(reason, token)
            );

        }

    });

    return { sent, failed };

}


// -----------------------------------------
// Message templates
// -----------------------------------------

function formatProjectRequest(request) {

    return [
        "📩 درخواست پروژه جدید",
        "",
        `👤 نام: ${truncate(request.name, 200)}`,
        `📞 تلفن: ${truncate(request.phone, 50)}`,
        `📧 ایمیل: ${truncate(request.email, 200)}`,
        `💰 بودجه: ${truncate(request.budget, 100)}`,
        "",
        "📝 توضیحات:",
        truncate(request.description, MAX_FIELD_LENGTH),
        "",
        request.id ? `🆔 شناسه: ${request.id}` : null,
        `🕒 زمان: ${formatNow()}`
    ].filter((line) => line !== null).join("\n");

}

function formatCooperationRequest(request) {

    return [
        "🤝 درخواست همکاری جدید",
        "",
        `👤 نام: ${truncate(request.name, 200)}`,
        `📞 تلفن: ${truncate(request.phone, 50)}`,
        `📧 ایمیل: ${truncate(request.email, 200)}`,
        `🎂 سن: ${truncate(request.age, 10)}`,
        `🧩 نوع همکاری: ${truncate(request.cooperationType, 100)}`,
        `🛠 مهارت‌ها: ${truncate(request.skills, 300)}`,
        "",
        "📝 توضیحات:",
        truncate(request.description, MAX_FIELD_LENGTH),
        "",
        request.id ? `🆔 شناسه: ${request.id}` : null,
        `🕒 زمان: ${formatNow()}`
    ].filter((line) => line !== null).join("\n");

}


module.exports = {
    notifyAdmins,
    getBotInfo,
    getRecentChats,
    formatProjectRequest,
    formatCooperationRequest
};
