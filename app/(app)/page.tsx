import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { mockMessages } from "@/lib/mock-data";

export default function ChatPage() {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center border-b border-neutral-200 px-6 dark:border-neutral-800">
        <h1 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Cozy cabin in the woods
        </h1>
      </header>

      <MessageList messages={mockMessages} />
      <ChatInput />
    </>
  );
}
