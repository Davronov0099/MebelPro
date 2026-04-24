// ─── Telegram Bot Notification Service ───────────────────────────────────────
// Bot token va chat_id .env faylida saqlanadi

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string;
const CHAT_ID   = import.meta.env.VITE_TELEGRAM_CHAT_ID   as string;

export interface ContactPayload {
  name:    string;
  email:   string;
  message: string;
}

/**
 * Yangi xabarni Telegram botiga yuboradi.
 * Telegram HTML parse mode ishlatiladi (bold, italic, code).
 */
export async function sendToTelegram(payload: ContactPayload): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error('Telegram credentials (.env) sozlanmagan.');
  }

  const now = new Date().toLocaleString('uz-UZ', {
    timeZone:    'Asia/Tashkent',
    year:        'numeric',
    month:       '2-digit',
    day:         '2-digit',
    hour:        '2-digit',
    minute:      '2-digit',
  });

  const text = [
    '🪑 <b>MebelPro — Yangi Xabar!</b>',
    '',
    `👤 <b>Ism:</b> ${escape(payload.name)}`,
    `📧 <b>Email:</b> <code>${escape(payload.email)}</code>`,
    '',
    `💬 <b>Xabar:</b>`,
    escape(payload.message),
    '',
    `🕐 <i>${now} (Toshkent vaqti)</i>`,
    '─────────────────────',
    '🌐 <i>mebelpro.uz orqali yuborildi</i>',
  ].join('\n');

  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        chat_id:    CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.description ?? `Telegram API xatosi: ${res.status}`);
  }
}

/** Telegram HTML uchun maxsus belgilarni escaped qiladi */
function escape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
