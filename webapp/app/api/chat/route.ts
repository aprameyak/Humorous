import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const topicPrompt = "Write a joke about the following topic and send it without additional text: ";
const randomPrompt = "Write a joke about any topic and send it without additional text";

async function joke(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-3.5-flash-lite" });
  const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
  return result.response.text();
}

export async function GET() {
  try {
    return NextResponse.json({ message: await joke(randomPrompt) });
  } catch {
    return NextResponse.json({ error: "Could not generate a joke" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { topic } = (await req.json()) as { topic?: string };
    return NextResponse.json({ message: await joke(topicPrompt + (topic ?? "")) });
  } catch {
    return NextResponse.json({ error: "Could not generate a joke" }, { status: 500 });
  }
}
