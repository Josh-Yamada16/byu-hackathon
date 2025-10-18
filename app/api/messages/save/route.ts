import { auth } from "@/app/(auth)/auth";
import { getChatById, saveMessages } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const { chatId, messages } = await request.json();

    // Verify user owns this chat
    const chat = await getChatById({ id: chatId });
    if (!chat || chat.userId !== session.user.id) {
      return new ChatSDKError("forbidden:chat").toResponse();
    }

    console.log("[API-MESSAGES-SAVE] Saving", messages.length, "messages for chat", chatId);

    // Save messages to DB
    const dbMessages = messages.map((m: any) => ({
      id: m.id,
      chatId,
      role: m.role,
      parts: JSON.stringify(m.parts),
      attachments: JSON.stringify([]),
      createdAt: Date.now(),
    }));

    await saveMessages({ messages: dbMessages });

    console.log("[API-MESSAGES-SAVE] ✓ Saved successfully");

    return Response.json({ success: true });
  } catch (error) {
    console.error("[API-MESSAGES-SAVE] Error:", error);
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return new ChatSDKError("bad_request:api").toResponse();
  }
}
