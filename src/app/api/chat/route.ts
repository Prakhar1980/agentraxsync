import connectDB from "@/lib/db";
import Settings from "@/model/setting.model";
import Chat from "@/model/chat.model";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
/* ================= CORS ================= */

function setCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}
 //check gemini


console.log("GEMINI KEY:", !!process.env.GEMINI_API_KEY);




export async function OPTIONS() {
  return setCors(new NextResponse(null, { status: 200 }));
}

/* ================= MAIN ================= */

export async function POST(req: NextRequest) {
  try {
    await connectDB();

   
    const { message, ownerId } = await req.json();

console.log("🔥 CHAT API HIT");
console.log("OWNER ID:", ownerId);
console.log("MESSAGE:", message);


    if (!message || !ownerId) {
      return setCors(
        NextResponse.json({ error: "Missing fields" }, { status: 400 })
      );
    }

    const settings = await Settings.findOne({ ownerId });

    if (!settings) {
      return setCors(
        NextResponse.json({
          reply: "Please configure your chatbot first in dashboard.",
        }, { status: 404 })
      );
    }

    const businessName =
      settings.businessName ||
      settings.buisenessName ||
      "Support Assistant";

    const knowledge = settings.knowledge || "";

    const sessionId = `${ownerId}-default`;

    /* ================= GEMINI ================= */

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

    // 🔥 PRO PROMPT (IMPORTANT FIX)
    const prompt = `
You are a professional AI customer support assistant for "${businessName}".

RULES:
- Answer naturally like a human support agent
- Use the knowledge base when relevant
- If you don't know something, politely say you are not fully sure
- Do NOT always suggest human support
- Only mention human support when user clearly asks for it or shows complaint
- Keep answers short (2-5 lines max)

KNOWLEDGE BASE:
${knowledge}

USER MESSAGE:
${message}
`;

    let text = "";

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    } catch (err) {
      console.error("Gemini Error:", err);
      text = "";
    }

    /* ================= SMART FALLBACK ================= */

    // only fallback if AI completely fails
    if (!text || text.trim().length < 2) {
      text = "Sorry, I couldn’t understand that clearly. Can you rephrase?";
    }

    /* ================= SAVE CHAT ================= */

    await Chat.findOneAndUpdate(
      { ownerId, sessionId },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", text: message },
              { role: "bot", text },
            ],
          },
        },
        status: "AI",
        escalated: false,
      },
      { upsert: true }
    );

    return setCors(
      NextResponse.json({
        reply: text,
        escalated: false,
      })
    );

  } catch (error) {
    console.error(error);

    return setCors(
      NextResponse.json(
        { reply: "Something went wrong." },
        { status: 500 }
      )
    );
  }
}
/*
import connectDB from "@/lib/db";
import Settings from "@/model/setting.model";
import Chat from "@/model/chat.model";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 🔥 ESCALATION DETECTOR
function shouldEscalate(message: string) {
  const lower = message.toLowerCase();

  const triggers = [
    "human",
    "agent",
    "support",
    "refund",
    "payment",
    "complaint",
    "angry",
    "frustrated",
  ];

  return triggers.some((word) => lower.includes(word));
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { message, ownerId } = body;

    if (!message || !ownerId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const settings = await Settings.findOne({ ownerId });

    if (!settings) {
      return NextResponse.json(
        { reply: "No configuration found." },
        { status: 404 }
      );
    }

    const businessName =
      settings.businessName ||
      settings.buisenessName ||
      "Support Assistant";

    const knowledge = settings.knowledge || "No knowledge provided";

    const sessionId = `${ownerId}-default`;

    // 🔥 STEP 1: ESCALATION BEFORE AI
    if (shouldEscalate(message)) {
      await Chat.findOneAndUpdate(
        { ownerId, sessionId },
        {
          $push: {
            messages: {
              $each: [
                { role: "user", text: message }, // 🔧 FIX: keep full history
                { role: "bot", text: "Escalated to human support" },
              ],
            },
          },
          escalated: true,
          status: "HUMAN",
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        reply: "I'm connecting you to a human agent. Please wait...",
        escalated: true,
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are an AI customer support assistant for: ${businessName}

Rules:
- Answer ONLY using the knowledge provided
- If the answer is not in the knowledge, say you will connect to human support
- Be polite, short, and professional
- Do NOT hallucinate

Escalation Awareness:
- If user asks for human → suggest escalation
- If user frustrated → calm response + escalation
- If refund/payment → suggest human support

Response Style:
- Max 2–3 sentences
- Clear and helpful

Knowledge Base:
${knowledge}

User Question:
${message}
`;

    let text = "";

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    } catch (err) {
      console.error("Gemini Error:", err);
      text =
        "I'm not sure about that. Let me connect you to a human agent.";
    }

    // 🔥 STEP 2: ESCALATION AFTER AI
    if (shouldEscalate(message) || shouldEscalate(text)) { // 🔧 FIX: safer logic
      await Chat.findOneAndUpdate(
        { ownerId, sessionId },
        {
          $push: {
            messages: {
              $each: [
                { role: "user", text: message },
                { role: "bot", text: text },
              ],
            },
          },
          escalated: true,
          status: "HUMAN",
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        reply: "I'm connecting you to a human agent. Please wait...",
        escalated: true,
      });
    }

    // 🔥 SAVE CHAT (AI RESPONSE)
    await Chat.findOneAndUpdate(
      { ownerId, sessionId },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", text: message },
              { role: "bot", text: text },
            ],
          },
        },
        escalated: false,
        status: "AI",
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      reply: text,
      escalated: false,
    });

  } catch (error) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      { reply: "Something went wrong." },
      { status: 500 }
    );
  }
}*/