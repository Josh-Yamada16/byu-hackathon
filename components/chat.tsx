"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { ChatHeader } from "@/components/chat-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import type { Vote } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { Attachment, ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { Artifact } from "./artifact";
import { useDataStream } from "./data-stream-provider";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import { toast } from "./toast";
import type { VisibilityType } from "./visibility-selector";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  initialLastContext,
  majorId,
  majorName,
  autoDescribeMajor,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  initialLastContext?: AppUsage;
  majorId?: string;
  majorName?: string;
  autoDescribeMajor?: boolean;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>("");
  const [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);

  const router = useRouter();

  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        return {
          body: {
            id: request.id,
            message: request.messages.at(-1),
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            majorId,
            majorName,
            ...request.body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
      if (dataPart.type === "data-usage") {
        setUsage(dataPart.data);
      }
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        // Check if it's a credit card error
        if (
          error.message?.includes("AI Gateway requires a valid credit card")
        ) {
          setShowCreditCardAlert(true);
        } else {
          toast({
            type: "error",
            description: error.message,
          });
        }
      }
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  // When there's no scraped description available, prompt the model to generate
  // a short description of the major automatically. This runs once per chat.
  useEffect(() => {
    // run only once per chat (use chatId as key to allow multiple majors)
    // store in a ref-like closure on window to avoid re-running across fast refreshes
    if (!(window as any).__autoDescribeSentMap) {
      (window as any).__autoDescribeSentMap = {};
    }

    const chatKey = `${id}-${majorName}`;
    const alreadySent = (window as any).__autoDescribeSentMap[chatKey];

    if (autoDescribeMajor && majorName && !alreadySent) {
      (window as any).__autoDescribeSentMap[chatKey] = true;

      const instruction = `Reply with exactly one assistant message only. Format the response exactly like this:

## ${majorName}

SHORT_DESCRIPTION

#### Skills students will learn:
- SKILL_1
- SKILL_2
- SKILL_3

#### Reasons someone might like this major:
- LIKE_REASON_1
- LIKE_REASON_2
- LIKE_REASON_3

#### Reasons someone might dislike this major:
- DISLIKE_REASON_1
- DISLIKE_REASON_2
- DISLIKE_REASON_3

Constraints:
- SHORT_DESCRIPTION must be 3-4 sentences, student-friendly, concise, and should NOT repeat only the major name.
- Each list should contain 3-4 short bullet points (phrases, not full sentences).
- Use Markdown header and bullet lists exactly as shown. Do NOT include HTML tags, angle brackets, or any extra commentary. Do not add any text before or after this block.`;

      // Send the user instruction to the model. We optimistically remove the user
      // message from the visible message list immediately so it doesn't appear in UI.
      sendMessage({
        role: "user",
        parts: [
          {
            type: "text",
            text: instruction,
          },
        ],
      });

      // Remove the instruction message from UI to keep it hidden.
      // Use a small timeout to allow the optimistic message to be created, then filter it out.
      setTimeout(() => {
        setMessages((prev) =>
          prev.filter(
            (m) =>
              !(
                m.role === "user" &&
                m.parts.some((p) => p.type === "text" && p.text === instruction)
              )
          )
        );
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDescribeMajor, majorName, id, sendMessage, setMessages]);

  // Store major → chatId mapping in localStorage for future redirects
  useEffect(() => {
    if (majorId && majorName) {
      try {
        const storageKey = `major-chat-${majorId}`;
        localStorage.setItem(storageKey, id);
      } catch (e) {
        // localStorage might be unavailable, ignore
      }
    }
  }, [id, majorId]);

  // Redirect from /chat?majorId=... to /chat/{id} after first response
  const redirectedRef = useRef(false);
  useEffect(() => {
    const hasMajorParams = majorId && majorName;
    const hasAssistantResponse = messages.some((m) => m.role === "assistant");
    const currentUrl = new URL(window.location.href);
    const isOnMajorPage = currentUrl.pathname === "/chat" && currentUrl.search.includes("majorId");

    // Only redirect if we have a solid assistant response (more than just step-start)
    const hasRealContent = messages.some(
      (m) =>
        m.role === "assistant" &&
        m.parts.some((p) => p.type === "text" || p.type?.startsWith("data-"))
    );

    if (hasMajorParams && hasRealContent && isOnMajorPage && !redirectedRef.current) {
      // Redirect to the actual chat page to prevent duplicate chats on refresh
      redirectedRef.current = true;
      // Use setTimeout to ensure sendMessage has been fully processed
      setTimeout(() => {
        router.push(`/chat/${id}`);
      }, 500);
    }
  }, [id, majorId, majorName, messages, router]);

  const { data: votes } = useSWR<Vote[]>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  return (
    <>
      <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
        <ChatHeader
          chatId={id}
          isReadonly={isReadonly}
          selectedVisibilityType={initialVisibilityType}
        />

        <Messages
          chatId={id}
          isArtifactVisible={isArtifactVisible}
          isReadonly={isReadonly}
          messages={messages}
          regenerate={regenerate}
          selectedModelId={initialChatModel}
          setMessages={setMessages}
          status={status}
          votes={votes}
        />

        <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
          {!isReadonly && (
            <MultimodalInput
              attachments={attachments}
              chatId={id}
              input={input}
              messages={messages}
              onModelChange={setCurrentModelId}
              selectedModelId={currentModelId}
              selectedVisibilityType={visibilityType}
              sendMessage={sendMessage}
              setAttachments={setAttachments}
              setInput={setInput}
              setMessages={setMessages}
              status={status}
              stop={stop}
              usage={usage}
            />
          )}
        </div>
      </div>

      <Artifact
        attachments={attachments}
        chatId={id}
        input={input}
        isReadonly={isReadonly}
        messages={messages}
        regenerate={regenerate}
        selectedModelId={currentModelId}
        selectedVisibilityType={visibilityType}
        sendMessage={sendMessage}
        setAttachments={setAttachments}
        setInput={setInput}
        setMessages={setMessages}
        status={status}
        stop={stop}
        votes={votes}
      />

      <AlertDialog
        onOpenChange={setShowCreditCardAlert}
        open={showCreditCardAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              This application requires{" "}
              {process.env.NODE_ENV === "production" ? "the owner" : "you"} to
              activate Vercel AI Gateway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.open(
                  "https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
                  "_blank"
                );
                window.location.href = "/";
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
