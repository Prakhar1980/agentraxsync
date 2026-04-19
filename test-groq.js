import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function run() {
  try {
   const res = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{ role: "user", content: "Say hello" }],
});

    console.log("RESPONSE:", res.choices[0].message.content);
  } catch (err) {
    console.error("ERROR:", err);
  }
}

run();