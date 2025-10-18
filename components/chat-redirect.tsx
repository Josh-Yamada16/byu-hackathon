"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * This component checks if a chat already exists for a given major.
 * If it does, it redirects to that chat instead of creating a new one.
 * Otherwise, it creates a new chat with a fresh ID.
 */
export function ChatRedirect({
  majorId,
  majorName,
}: {
  majorId: string;
  majorName: string;
}) {
  const router = useRouter();

  useEffect(() => {
    // Create a key to store the chat ID for this major
    const storageKey = `major-chat-${majorId}`;
    const existingChatId = localStorage.getItem(storageKey);

    if (existingChatId) {
      // Redirect to existing chat
      router.push(`/chat/${existingChatId}`);
    } else {
      // For new chats, we need to let the component render and then update localStorage
      // when the chat is created. The Chat component will pass the ID via URL params.
      // For now, just redirect back with special handling - actually we should create the component
      // and store the ID when first created.

      // Create a new chat by staying on this page, but we'll handle storage in Chat component
      // Store a flag so Chat component knows to save the ID
      sessionStorage.setItem(`create-for-major-${majorId}`, majorName);
    }
  }, [majorId, majorName, router]);

  // We can't render the Chat component here directly because we need to wait for async auth
  // Instead, return null and let the parent page component handle rendering
  return null;
}
