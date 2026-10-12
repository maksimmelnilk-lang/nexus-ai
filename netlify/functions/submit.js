exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    if (data.website) return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }) };
    const prompt = String(data.prompt || "").trim().slice(0, 3500);
    if (prompt.length < 5) return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: false, error: "Prompt too short" }) };

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: false, error: "Server is not configured" }) };

    const kind = data.kind === "music" ? "🎧 Музыка" : "🎬 Видео";
    const duration = data.kind === "music" ? "—" : `${String(data.duration || "5").slice(0, 2)} сек.`;
    const model = String(data.model || "Не указана").slice(0, 100);
    const contact = String(data.contact || "Не указан").slice(0, 80);
    const message = `🔔 Новая заявка Nexus AI\n\nТип: ${kind}\nМодель: ${model}\nДлительность: ${duration}\nКонтакт: ${contact}\n\nПромпт:\n${prompt}`;

    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });
    const result = await tg.json();
    if (!tg.ok || !result.ok) return { statusCode: 502, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: false, error: "Telegram send failed" }) };

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }) };
  } catch (_) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: false, error: "Invalid request" }) };
  }
};
