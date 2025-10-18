import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const params = await searchParams;
  const majorId =
    typeof params.majorId === "string" ? params.majorId : undefined;
  const majorName =
    typeof params.majorName === "string"
      ? decodeURIComponent(params.majorName)
      : undefined;

  const id = generateUUID();

  // Do not pull any scraped description. Let the AI generate the short description.
  const initialMessages = [] as any[];
  const autoDescribeMajor = Boolean(majorName);

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  // system prompt is handled in the API layer; no client-side use required here

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          autoDescribeMajor={autoDescribeMajor}
          autoResume={false}
          id={id}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialMessages={initialMessages}
          initialVisibilityType="private"
          isReadonly={false}
          key={id}
          majorId={majorId}
          majorName={majorName}
        />
        <DataStreamHandler />
      </>
    );
  }

  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={modelIdFromCookie.value}
        initialMessages={initialMessages}
        initialVisibilityType="private"
        isReadonly={false}
        key={id}
        majorId={majorId}
        majorName={majorName}
      />
      <DataStreamHandler />
    </>
  );
}
