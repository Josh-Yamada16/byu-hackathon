"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";

export default function ComparisonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [comparisonChatId, setComparisonChatId] = useState<string | null>(null);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Get major parameters from URL
  const major1Id = searchParams?.get("major1");
  const major1Name = searchParams?.get("major1Name");
  const major2Id = searchParams?.get("major2");
  const major2Name = searchParams?.get("major2Name");

  // Create a comparison key
  const comparisonKey = major1Id && major2Id ? `${major1Id}|${major2Id}` : null;
  const storageKey = comparisonKey ? `major-chat-${comparisonKey}` : null;

  // On mount, check if we have an existing chat or need to create a new one
  useEffect(() => {
    setIsClient(true);

    if (storageKey && !comparisonChatId) {
      const existingChatId = localStorage.getItem(storageKey);
      if (existingChatId) {
        // Found existing chat - redirect to it
        setRedirectAttempted(true);
        router.push(`/chat/${existingChatId}`);
      } else {
        // No existing chat - generate new UUID for this comparison
        setComparisonChatId(generateUUID());
      }
    }
  }, [storageKey, comparisonChatId, router]);

  if (!isClient) {
    return null;
  }

  // Don't render if we're redirecting to an existing chat
  if (redirectAttempted) {
    return null;
  }

  if (!comparisonChatId) {
    return null;
  }

  if (!major1Id || !major1Name || !major2Id || !major2Name) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">Invalid Comparison</h1>
          <p className="text-gray-600">Please select two majors to compare.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Chat
        autoDescribeMajor={true}
        autoResume={false}
        id={comparisonChatId}
        initialChatModel={DEFAULT_CHAT_MODEL}
        initialMessages={[]}
        initialVisibilityType="public"
        isReadonly={false}
        majorId={comparisonKey || undefined}
        majorName={`${major1Name} vs ${major2Name}`}
      />
      <DataStreamHandler />
    </>
  );
}
