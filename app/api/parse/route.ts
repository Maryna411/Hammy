import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5-20251001";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const SYSTEM_PROMPT = `Ти — асистент, який перетворює хаотичний "brain dump" (усе, що людина вивалила з голови текстом або голосом) на список чітких задач.

Сьогоднішня дата: ${todayISO()} (формат YYYY-MM-DD).

Для кожної окремої дії чи задачі, яку ти знаходиш у тексті, поверни obʼєкт з полями:
- "title": коротка чітка назва задачі українською (дієслово + суть, без зайвих слів)
- "priority": "high" | "medium" | "low" — оціни важливість/терміновість із контексту
- "estimatedMinutes": реалістична оцінка часу в хвилинах (число, кратне 5, від 5 до 480)
- "deadline": дата у форматі YYYY-MM-DD, якщо в тексті є хоч якийсь натяк на строк ("сьогодні", "завтра", "до пʼятниці", конкретна дата) — інакше null

Правила:
- Розбивай складові речення на окремі задачі, якщо в них декілька дій.
- Ігноруй порожні фрази, вигуки, все, що не є дією.
- Якщо в тексті немає жодної задачі — поверни порожній масив.
- Відповідай ЛИШЕ JSON-масивом об'єктів, без пояснень, без markdown-обгортки.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY не налаштований на сервері." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const text: string = (body?.text || "").toString().trim();

    if (!text) {
      return NextResponse.json({ error: "Порожній текст." }, { status: 400 });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Ось brain dump:\n"""\n${text}\n"""\n\nПоверни JSON-масив задач.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Anthropic API error:", res.status, errText);
      return NextResponse.json(
        { error: `Помилка AI-сервісу (${res.status}). Спробуй ще раз.` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw: string = data?.content?.[0]?.text ?? "[]";

    let tasks: unknown;
    try {
      const cleaned = raw
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "");
      tasks = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", raw);
      return NextResponse.json(
        { error: "AI повернув некоректний формат. Спробуй переформулювати." },
        { status: 502 }
      );
    }

    if (!Array.isArray(tasks)) {
      return NextResponse.json({ error: "Неочікувана відповідь AI." }, { status: 502 });
    }

    const sanitized = tasks
      .filter((t: any) => t && typeof t.title === "string" && t.title.trim())
      .map((t: any) => ({
        title: String(t.title).trim().slice(0, 200),
        priority: ["high", "medium", "low"].includes(t.priority) ? t.priority : "medium",
        estimatedMinutes:
          Number.isFinite(t.estimatedMinutes) && t.estimatedMinutes > 0
            ? Math.min(480, Math.round(t.estimatedMinutes))
            : 30,
        deadline:
          typeof t.deadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.deadline)
            ? t.deadline
            : null,
      }));

    return NextResponse.json({ tasks: sanitized });
  } catch (err) {
    console.error("Parse route error:", err);
    return NextResponse.json({ error: "Внутрішня помилка сервера." }, { status: 500 });
  }
}
