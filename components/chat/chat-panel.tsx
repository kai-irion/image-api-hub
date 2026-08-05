"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types";

function truncateTitle(prompt: string): string {
  const trimmed = prompt.trim();
  return trimmed.length > 60 ? `${trimmed.slice(0, 60)}...` : trimmed;
}

export function ChatPanel({
  chatId,
  initialMessages,
}: {
  chatId: string;
  initialMessages: ChatMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleSend(prompt: string, attachment: File | null) {
    const isFirstMessage = messages.length === 0;
    const supabase = createClient();

    setIsGenerating(true);

    const { data: userMessage, error: insertError } = await supabase
      .from("messages")
      .insert({ chat_id: chatId, role: "user", content: prompt })
      .select("id, created_at")
      .single();

    if (insertError || !userMessage) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Failed to send your message. Please try again.",
          status: "error",
        },
      ]);
      setIsGenerating(false);
      return;
    }

    const pendingId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      {
        id: userMessage.id,
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

    if (isFirstMessage) {
      await supabase.from("chats").update({ title: truncateTitle(prompt) }).eq("id", chatId);
    }

    try {
      const body = new FormData();
      body.set("prompt", prompt);
      body.set("chatId", chatId);
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
                id: data.message.id,
                role: "assistant",
                content: data.message.content,
                imageUrl: data.message.imageUrl,
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
      router.refresh();
    }
  }

  return (
    <>
      <MessageList messages={messages} />
      <ChatInput onSend={handleSend} disabled={isGenerating} />
    </>
  );
}
