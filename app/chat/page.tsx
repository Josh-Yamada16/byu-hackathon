import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ChatPageWrapper } from "@/components/chat-page-wrapper";
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
  const autoDescribeMajor = Boolean(majorName);

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const initialChatModel = modelIdFromCookie?.value || DEFAULT_CHAT_MODEL;

  return (
    <ChatPageWrapper
      id={id}
      majorId={majorId}
      majorName={majorName}
      initialChatModel={initialChatModel}
      autoDescribeMajor={autoDescribeMajor}
    />
  );
}
