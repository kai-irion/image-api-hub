"use client";

import { useState } from "react";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import type { ChatMessage } from "@/lib/types";

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleSend(prompt: string, attachment: File | null) {
    const pendingId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
        attachmentName: attachment?.name,
      },
      {
        id: pendingId,
        role: "assistant",
        content: attachment ? "Editing image..." : "Generating image...",
        status: "pending",
      },
    ]);
    setIsGenerating(true);

    try {
      const body = new FormData();
      body.set("prompt", prompt);
      if (attachment) body.set("image", attachment);

      const response = await fetch("/api/generate", { method: "POST", body });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate image.");
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.id === pendingId
            ? {
                ...message,
                content: "Here's your image.",
                imageUrl: data.imageUrl,
                status: undefined,
              }
            : message,
        ),
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === pendingId
            ? {
                ...message,
                content:
                  error instanceof Error
                    ? error.message
                    : "Something went wrong generating the image.",
                status: "error",
              }
            : message,
        ),
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <MessageList messages={messages} />
      <ChatInput onSend={handleSend} disabled={isGenerating} />
    </>
  );
}
