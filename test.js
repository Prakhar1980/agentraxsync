require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function run() {
  try {
    const res = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: "Hello" }
      ],
      temperature: 0.7,
    });

    console.log("✅ GROQ RESPONSE:");
    console.log(res.choices[0].message.content);
  } catch (err) {
    console.error(" ERROR:", err);
  }
}

run();