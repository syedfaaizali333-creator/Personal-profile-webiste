// FAAIZ.DEV — serverless AI proxy (Vercel Function).
// The API key lives ONLY in this server environment (Vercel → Project →
// Settings → Environment Variables). The browser never sees it.
// Set FAAIZ_CONFIG.AI_ENDPOINT = "/api/assistant" in js/config.js to enable.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const KEY = process.env.AI_API_KEY;
  if (!KEY) return res.status(501).json({ error: "AI not configured — the site falls back to its built-in knowledge base." });

  const { message, lang } = req.body || {};
  if (!message || typeof message !== "string" || message.length > 500) {
    return res.status(400).json({ error: "Invalid message" });
  }

  const SYSTEM = `You are Faaiz AI, the portfolio assistant for Syed Faaiz Bin Shan E Ali, a student developer & aspiring web developer.
Ground every answer in these verified facts only: skills — HTML5, CSS3, JavaScript, React (learning), Node.js (learning), Supabase, Firebase, UI design, Photoshop, Illustrator.
Projects — iHub Marketplace (Firebase marketplace concept), RAASTAGO (road-information concept), Aversion University (multi-page university site), TravelNestAgency (travel site), Headphone Website ("Feel Every Beat" product concept), FAAIZ.DEV Portfolio (this site).
Never invent experience, metrics, jobs or certificates. ${lang === "urdu" ? "Reply in friendly Roman Urdu." : "Reply in clear, friendly English."} Keep answers under 90 words.`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: message }],
        max_tokens: 220,
        temperature: 0.4
      })
    });
    if (!r.ok) return res.status(502).json({ error: "AI provider error" });
    const data = await r.json();
    const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!reply) return res.status(502).json({ error: "Empty AI response" });
    res.status(200).json({ reply: reply.trim() });
  } catch (_) {
    res.status(502).json({ error: "AI provider unreachable" });
  }
}
