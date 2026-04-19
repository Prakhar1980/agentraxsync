const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent("Hello");
    const response = await result.response;
    const text = response.text();

    console.log("✅ GEMINI RESPONSE:");
    console.log(text);
  } catch (err) {
    console.error("❌ ERROR:", err);
  }
}

run();