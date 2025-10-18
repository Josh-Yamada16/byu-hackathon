import fs from "node:fs";
import path from "node:path";
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

  // Lookup major description from scraped program data (if available)
  let initialMessages = [] as any[];
  let desc: string | undefined;
  try {
    const programsJsonPath = path.join(
      process.cwd(),
      "scraping",
      "programs.json"
    );
    const file = fs.readFileSync(programsJsonPath, "utf8");
    const programsData = JSON.parse(file) as any;
    const programs: any[] = programsData?.data || [];
    const program = majorId
      ? programs.find((p) => p.code === majorId || p.id === majorId)
      : undefined;

    desc = program
      ? program.catalogDescription ||
        program.description ||
        program.catalogFullDescription ||
        program.longName ||
        program.name
      : undefined;

    if (majorName && desc) {
      // If the scraped description is just the same as the major name, skip repeating it
      const shortDesc =
        desc.trim().toLowerCase() === majorName.trim().toLowerCase()
          ? undefined
          : desc;

      const text = shortDesc
        ? `Here's a short description of ${majorName}: ${shortDesc}`
        : `You're now chatting about ${majorName}. I can help with coursework, degree requirements, and career paths related to this field — what would you like to ask?`;
      initialMessages = [
        {
          id: generateUUID(),
          role: "assistant",
          parts: [{ type: "text", text }],
          metadata: { createdAt: new Date().toISOString() },
        },
      ];
    }
  } catch {
    // ignore lookup errors and fall back to empty initialMessages
    initialMessages = [];
  }

  const autoDescribeMajor = Boolean(majorName && !desc);

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
