import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { texts = [], tone = "Formal professional" } = await req.json();
    const system =
      "You are a contractor's writing assistant. Rewrite each scope-of-work line to be clear, professional, and grammatically correct. Preserve all quantities, material names, colors, and any dollar amounts or numbers. Do not change pricing or scope semantics. Return one rewritten line per input.";
    const user =
      `Tone: ${tone}. Lines:\n` +
      texts.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    });

    const out = completion.choices?.[0]?.message?.content || "";
    const polished = out
      .split(/\n+/)
      .map((s) => s.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);

    return NextResponse.json({
      polished: polished.length ? polished : texts,
    });
  } catch {
    return NextResponse.json({ polished: [] });
  }
}
