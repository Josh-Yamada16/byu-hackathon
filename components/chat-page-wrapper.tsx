"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";

export function ChatPageWrapper({
  id,
  majorId,
  majorName,
  initialChatModel,
  autoDescribeMajor,
}: {
  id: string;
  majorId?: string;
  majorName?: string;
  initialChatModel: string;
  autoDescribeMajor: boolean;
}) {
  const router = useRouter();
  
  // Check if we already have a chat for this major (synchronously on mount)
  let existingChatId: string | null = null;
  if (typeof window !== "undefined" && majorId) {
    const storageKey = `major-chat-${majorId}`;
    existingChatId = localStorage.getItem(storageKey);
  }

  const shouldRedirect = existingChatId && existingChatId !== id;
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (shouldRedirect && !hasRedirected) {
      setHasRedirected(true);
      router.push(`/chat/${existingChatId}`);
    }
  }, [shouldRedirect, existingChatId, id, router, hasRedirected]);

  // Don't render anything if we're redirecting
  if (shouldRedirect) {
    return null;
  }

  return (
    <>
      <Chat
        autoDescribeMajor={autoDescribeMajor}
        autoResume={false}
        id={id}
        initialChatModel={initialChatModel}
        initialMessages={[] as any[]}
        initialVisibilityType="private"
        isReadonly={false}
        majorId={majorId}
        majorName={majorName}
      />
      <DataStreamHandler />
    </>
  );
}
