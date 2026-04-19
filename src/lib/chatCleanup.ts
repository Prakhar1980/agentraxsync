import Chat from "@/model/chat.model";

/**
 *  AUTO RECOVERY SYSTEM
 * Runs every minute and checks:
 * - If chat is WAITING_FOR_AGENT > 4 min
 * - Then revert back to AI mode
 */
export function startChatCleanup() {
  setInterval(async () => {
    try {
      const FOUR_MINUTES_AGO = new Date(Date.now() - 4 * 60 * 1000);

      const result = await Chat.updateMany(
        {
          status: "WAITING_FOR_AGENT",
          updatedAt: { $lt: FOUR_MINUTES_AGO },
        },
        {
          $set: {
            status: "AI",
            awaitingConfirmation: false,
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `🔄 Auto-recovered ${result.modifiedCount} chats back to AI`
        );
      }
    } catch (err) {
      console.error("Chat cleanup error:", err);
    }
  }, 60 * 1000); 
}