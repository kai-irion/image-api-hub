import { ChatPanel } from "@/components/chat/chat-panel";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center border-b border-neutral-200 px-6 dark:border-neutral-800">
        <h1 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          New chat
        </h1>
      </header>

      <ChatPanel key={chatId} />
    </>
  );
}
