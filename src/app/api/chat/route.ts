import connectDB from "@/lib/db";
import Settings from "@/model/setting.model";
import Chat from "@/model/chat.model";
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

function setCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return setCors(new NextResponse(null, { status: 200 }));
}
const SETTINGS_CACHE_TTL_MS = 60_000;
let settingsCache: Record<string, { data: any; cachedAt: number }> = {};

function isUserRequestingAgent(message: string) {
  const lower = message.toLowerCase().trim();
  return ["agent", "human", "connect agent", "support", "representative"].some(
    (k) => lower.includes(k)
  );
}

function isUserSayingAI(message: string) {
  const lower = message.toLowerCase().trim();
  return ["ai", "bot", "continue", "continue ai"].some((k) =>
    lower.includes(k)
  );
}

function isUserSayingYes(message: string) {
  const lower = message.toLowerCase().trim();
  return ["yes", "y", "haan", "ha", "ok", "okay", "sure"].includes(lower);
}

function detectFrustration(messages: any[], message: string) {
  const lower = message.toLowerCase();

  const frustrationSignals = [
    "again",
    "not helping",
    "useless",
    "worst",
    "angry",
    "frustrated",
    "still same",
    "connect agent",
  ];

  const repeatCount =
    messages?.slice(-6)?.filter(
      (m: any) =>
        m.role === "user" &&
        typeof m.text === "string" &&
        m.text.toLowerCase() === lower
    ).length || 0;

  const keywordHit = frustrationSignals.some((k) => lower.includes(k));

  return keywordHit || repeatCount >= 2;
}

function getRepeatCount(messages: any[], message: string) {
  const lower = message.toLowerCase().trim();

  return (
    messages?.slice(-6)?.filter(
      (m: any) =>
        m.role === "user" &&
        typeof m.text === "string" &&
        m.text.toLowerCase().trim() === lower
    ).length || 0
  );
}

async function getAIReply(prompt: string) {
  const completion = groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const result: any = await completion;
  return result?.choices?.[0]?.message?.content || "";
}
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return setCors(
        NextResponse.json({ reply: "Invalid JSON body" }, { status: 400 })
      );
    }

    const message = body?.message?.toString?.().trim?.();
    const ownerId = body?.ownerId?.toString?.().trim?.();
    const sessionId = body?.sessionId?.toString?.().trim?.();
    const now = new Date();

    if (!message || !ownerId || !sessionId) {
      return setCors(
        NextResponse.json({ reply: "Missing fields" }, { status: 400 })
      );
    }

    await Chat.updateOne(
      { ownerId, sessionId },
      {
        $setOnInsert: {
          ownerId,
          sessionId,
        },
        $set: {
          isOnline: true,
          ended: false,
          lastSeen: now,
        },
      },
      { upsert: true }
    );

    let settings = settingsCache[ownerId]?.data;
    const cachedAt = settingsCache[ownerId]?.cachedAt || 0;

    if (!settings || Date.now() - cachedAt > SETTINGS_CACHE_TTL_MS) {
      settings = await Settings.findOne({ ownerId }).lean();
      settingsCache[ownerId] = { data: settings, cachedAt: Date.now() };
    }
    let existingChat: any = await Chat.findOne({ ownerId, sessionId });

    if (existingChat) {
      const lastSeen = new Date(existingChat.lastSeen);
      const now = new Date();
      const diff = (now.getTime() - lastSeen.getTime()) / 1000;

      if (
        diff > 300 &&
        !existingChat.ended &&
        existingChat.status !== "WAITING_FOR_AGENT" &&
        existingChat.status !== "HUMAN"
      ) {
        await Chat.updateOne(
          { ownerId, sessionId },
          {
            $set: {
              ended: true,
              status: "ENDED",
            },
          }
        );

        existingChat.ended = true;
        existingChat.status = "ENDED";
      }
    }
    if (
      existingChat &&
      existingChat.status === "HUMAN" &&
      (!existingChat.messages || existingChat.messages.length === 0)
    ) {
      await Chat.updateOne(
        { ownerId, sessionId },
        {
          status: "AI",
          escalated: false,
        }
      );

      existingChat.status = "AI";
      existingChat.escalated = false;
    }

    if (!settings) {
      return setCors(
        NextResponse.json({ reply: "Please configure chatbot first." })
      );
    }

    const businessName =
      settings.businessName || settings.buisenessName || "Support Assistant";

 

    const rawKnowledge = settings.knowledge || "No knowledge available.";
    const knowledge = rawKnowledge.slice(0, 1000);

    const messages = existingChat?.messages || [];
    if (existingChat?.status === "HUMAN") {
      const lastSeen = new Date(existingChat.lastSeen);
      const now = new Date();
      const diff = (now.getTime() - lastSeen.getTime()) / 1000;

      if (diff > 60) {
        await Chat.updateOne(
          { ownerId, sessionId },
          {
            $set: {
              status: "AI",
              escalated: false,
            },
          }
        );

        existingChat.status = "AI";
        existingChat.escalated = false;
      } else {
        await Chat.updateOne(
          { ownerId, sessionId },
          {
            $push: { messages: { role: "user", text: message } },
            $set: { lastSeen: new Date() },
          }
        );

        return setCors(
          NextResponse.json({
            reply: "Agent is handling your chat. Please wait...",
            escalated: true,
          })
        );
      }
    }
    if (existingChat?.status === "WAITING_FOR_AGENT") {
      const requestedAt = existingChat?.agentRequestedAt;

      if (!requestedAt) {
        return setCors(
          NextResponse.json({
            reply: "Connecting you to an agent. Please wait...",
            escalated: true,
          })
        );
      }

      const now = new Date();
      const diff = (now.getTime() - new Date(requestedAt).getTime()) / 1000;

      if (diff < 30) {
        await Chat.updateOne(
          { ownerId, sessionId },
          {
            $push: { messages: { role: "user", text: message } },
            $set: { lastSeen: new Date() },
          }
        );

        return setCors(
          NextResponse.json({
            reply: "Connecting you to an agent. Please wait...",
            escalated: true,
          })
        );
      }

      await Chat.updateOne(
        { ownerId, sessionId },
        {
          $set: {
            status: "AI",
            escalated: false,
          },
          $push: {
            messages: {
              role: "bot",
              text: "All agents are currently busy. I'll continue assisting you. Please tell me your issue.",
            },
          },
        }
      );

      return setCors(
        NextResponse.json({
          reply:
            "All agents are currently busy. I'll continue assisting you. Please tell me your issue.",
          escalated: false,
        })
      );
    }
    if (existingChat?.awaitingConfirmation) {
      // user wants AI continue
      if (isUserSayingAI(message)) {
        await Chat.updateOne(
          { ownerId, sessionId },
          {
            $push: { messages: { role: "user", text: message } },
            $set: { awaitingConfirmation: false, lastSeen: new Date() },
          }
        );

        return setCors(
          NextResponse.json({
            reply: "Okay, AI will continue helping you.",
            escalated: false,
          })
        );
      }

      // user confirms agent
      if (isUserSayingYes(message) || isUserRequestingAgent(message)) {
        await Chat.updateOne(
          { ownerId, sessionId },
          {
            $push: {
              messages: {
                $each: [
                  { role: "user", text: message },
                  {
                    role: "bot",
                    text: "Connecting you to an agent. Please wait...",
                  },
                ],
              },
            },
            $set: {
              status: "WAITING_FOR_AGENT",
              escalated: true,
              awaitingConfirmation: false,
              agentRequestedAt: new Date(),
              lastSeen: new Date(),
            },
          }
        );

        // notify agents
        global.io?.to(`owner:${ownerId}`).emit("new_chat_request", {
          sessionId,
          ownerId,
        });

        return setCors(
          NextResponse.json({
            reply: "Connecting you to an agent. Please wait...",
            escalated: true,
          })
        );
      }

      await Chat.updateOne(
        { ownerId, sessionId },
        {
          $push: { messages: { role: "user", text: message } },
          $set: { awaitingConfirmation: false, lastSeen: new Date() },
        }
      );

      return setCors(
        NextResponse.json({
          reply: "Okay, I'll continue assisting you.",
          escalated: false,
        })
      );
    }

    if (isUserRequestingAgent(message)) {
      await Chat.updateOne(
        { ownerId, sessionId },
        {
          $push: {
            messages: {
              $each: [
                { role: "user", text: message },
                {
                  role: "bot",
                  text: "Sure. Type YES to connect you to a human agent, or type AI to continue with me.",
                },
              ],
            },
          },
          $set: {
            awaitingConfirmation: true,
            lastSeen: new Date(),
          },
        },
        { upsert: true }
      );

      return setCors(
        NextResponse.json({
          reply:
            "Sure. Type YES to connect you to a human agent, or type AI to continue with me.",
          escalated: false,
        })
      );
    }

    const repeatCount = getRepeatCount(messages, message);

    if (repeatCount >= 2) {
      await Chat.updateOne(
        { ownerId, sessionId },
        {
          $push: {
            messages: {
              $each: [
                { role: "user", text: message },
                {
                  role: "bot",
                  text: "I noticed you're repeating the same issue. Do you want AI to continue or connect to a human agent? Type AI or YES.",
                },
              ],
            },
          },
          $set: {
            awaitingConfirmation: true,
            lastSeen: new Date(),
          },
        },
        { upsert: true }
      );

      return setCors(
        NextResponse.json({
          reply:
            "I noticed you're repeating the same issue. Do you want AI to continue or connect to a human agent? Type AI or YES.",
          escalated: false,
        })
      );
    }

    /*SMART ESCALATION  */

    const isStrongFrustration = detectFrustration(messages, message);

    const shouldEscalate =
      isStrongFrustration &&
      (!existingChat ||
        (existingChat.status !== "WAITING_FOR_AGENT" &&
          existingChat.status !== "HUMAN" &&
          !existingChat.awaitingConfirmation));

    if (shouldEscalate) {
      await Chat.updateOne(
        { ownerId, sessionId },
        {
          $push: {
            messages: {
              $each: [
                { role: "user", text: message },
                {
                  role: "bot",
                  text: "I understand you're facing an issue. Type YES to connect with a human agent, or type AI to continue with me.",
                },
              ],
            },
          },
          $set: {
            awaitingConfirmation: true,
            status: "AI",
            lastSeen: new Date(),
          },
        },
        { upsert: true }
      );

      return setCors(
        NextResponse.json({
          reply:
            "I understand you're facing an issue. Type YES to connect with a human agent, or type AI to continue with me.",
          escalated: false,
        })
      );
    }
//ai
    const lastBotMessage =
      [...(messages || [])]
        .reverse()
        .find((m: any) => m.role === "bot")?.text || "";

    const prompt = `
You are a smart customer support assistant for "${businessName}".

RULES:
- Answer naturally (not robotic)
- Avoid repeating same sentences
- Be helpful and clear
- If user repeats → respond differently
- If unsure → say "I'll connect you to a human agent"

IMPORTANT:
Do NOT repeat this previous reply:
"${lastBotMessage}"

KNOWLEDGE:
"${knowledge}"

USER:
${message}
`;

    const statusBeforeAI = existingChat?.status || "AI";

    let text = "";

    try {
      const aiPromise = getAIReply(prompt);

      const timeout = new Promise<string>((resolve) =>
        setTimeout(() => resolve("AI timeout. Try again."), 8000)
      );

      text = (await Promise.race([aiPromise, timeout])) as string;
    } catch {
      text = "AI error. Please try again.";
    }

    if (!text.trim()) {
      text = "Sorry, I didn’t understand that.";
    }
    const latestChat: any = await Chat.findOne({ ownerId, sessionId }).lean();

    if (
      latestChat &&
      latestChat.status &&
      latestChat.status !== "AI" &&
      statusBeforeAI === "AI"
    ) {
      await Chat.updateOne(
        { ownerId, sessionId },
        {
          $push: { messages: { role: "user", text: message } },
          $set: { lastSeen: new Date() },
        },
        { upsert: true }
      );

      return setCors(
        NextResponse.json({
          reply: "Connecting you to an agent. Please wait...",
          escalated: true,
        })
      );
    }
    await Chat.updateOne(
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
        $set: {
          lastSeen: new Date(),
        },
      },
      { upsert: true }
    );

    global.io?.to(sessionId).emit("receive_message", {
      message: text,
      sender: "bot",
    });

const isNewChat = !existingChat || messages.length === 0;

const welcomeMessage =
  settings.welcomeMessage || `Welcome to ${businessName} Support 👋`;

const agentHintMessage =
  settings.agentHintMessage ||
  "You can type AGENT anytime to speak with support.";

return setCors(
  NextResponse.json({
    welcomeMessage: isNewChat ? welcomeMessage : null,
    agentHintMessage: isNewChat ? agentHintMessage : null,
    reply: text,
    escalated: false,
  })
);
  } catch (error) {
    console.error(error);

    return setCors(
      NextResponse.json({ reply: "Server error" }, { status: 500 })
    );
  }
}
