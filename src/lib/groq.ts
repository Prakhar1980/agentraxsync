import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function askGroq(message: string) {
  const res = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "You are a helpful chatbot for website users.",
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return res.choices[0].message.content;
}