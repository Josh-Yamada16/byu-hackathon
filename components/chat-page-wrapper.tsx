"use client";

import { useEffect, useState } from "react";
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
  const [shouldRender, setShouldRender] = useState(false);
  const [resolvedId, setResolvedId] = useState(id);

  useEffect(() => {
    // Check if we already have a chat for this major
    if (majorId) {
      const storageKey = `major-chat-${majorId}`;
      const existingChatId = localStorage.getItem(storageKey);

      if (existingChatId && existingChatId !== id) {
        // Redirect to existing chat instead of creating a new one
        router.push(`/chat/${existingChatId}`);
        return; // Don't render anything, just redirect
      }
    }

    // If no existing chat or no majorId, proceed with rendering
    setResolvedId(id);
    setShouldRender(true);
  }, [id, majorId, router]);

  // Don't render anything until we've checked localStorage
  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <Chat
        autoDescribeMajor={autoDescribeMajor}
        autoResume={false}
        id={resolvedId}
        initialChatModel={initialChatModel}
        initialMessages={[] as any[]}
        initialVisibilityType="private"
        isReadonly={false}
        key={resolvedId}
        majorId={majorId}
        majorName={majorName}
      />
      <DataStreamHandler />
    </>
  );
}
