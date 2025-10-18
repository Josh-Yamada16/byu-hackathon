import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";
import { auth } from "@/app/(auth)/auth";

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
  const majorId = typeof params.majorId === 'string' ? params.majorId : undefined;
  const majorName = typeof params.majorName === 'string' ? decodeURIComponent(params.majorName) : undefined;

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  // Create system message with major information if available
  const systemMessage = majorId && majorName
    ? `You are a helpful chatbot specialized for ${majorName} majors. Help the user with questions related to their field of study.`
    : undefined;

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          autoResume={false}
          id={id}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialMessages={[]}
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
        initialMessages={[]}
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
