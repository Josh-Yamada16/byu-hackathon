"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import React, { memo } from "react";
import type { ChatMessage } from "@/lib/types";
import { Suggestion } from "./elements/suggestion";
import type { VisibilityType } from "./visibility-selector";

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
  lastMessageText?: string;
};

function PureSuggestedActions({
  chatId,
  sendMessage,
  lastMessageText,
}: SuggestedActionsProps) {
  const [suggestions, setSuggestions] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const fetchSuggestions = async () => {
      // If there's no meaningful lastMessageText, skip fetching and leave
      // suggestions as null so the caller can render nothing.
      if (!lastMessageText || !lastMessageText.trim()) {
        setSuggestions(null);
        return;
      }
      try {
        const res = await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lastMessage: lastMessageText, limit: 4 }),
        });

        if (!res.ok) {
          setSuggestions([]);
          return;
        }

        const json = await res.json();
        if (!mounted) {
          return;
        }
        setSuggestions(Array.isArray(json.suggestions) ? json.suggestions : []);
      } catch (_err) {
        // ignore and show default static suggestions
        setSuggestions([]);
      }
    };

    fetchSuggestions();

    return () => {
      mounted = false;
    };
  }, [lastMessageText]);

  // Do not show any default/static suggestions; only render when the
  // suggestion generator returns results. While suggestions are null
  // (loading) or an empty array, render nothing.
  const displayed = suggestions ?? [];

  if (displayed.length === 0) {
    return null;
  }

  return (
    <div
      className="grid w-full gap-2 sm:grid-cols-2"
      data-testid="suggested-actions"
    >
      {displayed.map((suggestedAction, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          initial={{ opacity: 0, y: 20 }}
          key={suggestedAction}
          transition={{ delay: 0.05 * index }}
        >
          <Suggestion
            className="h-auto w-full whitespace-normal p-3 text-left"
            onClick={(suggestion) => {
              window.history.replaceState({}, "", `/chat/${chatId}`);
              sendMessage({
                role: "user",
                parts: [{ type: "text", text: suggestion }],
              });
            }}
            suggestion={suggestedAction}
          >
            {suggestedAction}
          </Suggestion>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }

    // Re-render when the incoming assistant text changes
    if (prevProps.lastMessageText !== nextProps.lastMessageText) {
      return false;
    }

    return true;
  }
);
