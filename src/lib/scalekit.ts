import { Scalekit } from "@scalekit-sdk/node";

let scalekit: Scalekit | null = null;

try {
  if (
    process.env.SCALEKIT_ENVIRONMENT_URL &&
    process.env.SCALEKIT_CLIENT_ID &&
    process.env.SCALEKIT_CLIENT_SECRET
  ) {
    scalekit = new Scalekit(
      process.env.SCALEKIT_ENVIRONMENT_URL,
      process.env.SCALEKIT_CLIENT_ID,
      process.env.SCALEKIT_CLIENT_SECRET
    );
  } else {
    console.warn("⚠️ Scalekit env not configured");
  }
} catch (err) {
  console.error("❌ Scalekit init failed:", err);
}

export { scalekit };