import type { ChatMessage } from "@/lib/types";

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-neutral-700 dark:text-neutral-200">
            What should we create?
          </h2>
          <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
            Describe an image, or attach one to edit it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xl rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
        }`}
      >
        {message.attachmentName && (
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-black/10 px-2 py-1 text-xs dark:bg-white/10">
            <ImageIcon />
            {message.attachmentName}
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.imageUrl}
            alt="Generated result"
            className="mt-2 w-full max-w-sm rounded-lg border border-black/10 dark:border-white/10"
          />
        )}
      </div>
    </div>
  );
}

function ImageIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect
        x="2"
        y="3"
        width="12"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="5.5" cy="6.5" r="1" fill="currentColor" />
      <path
        d="m3.5 11.5 3-3 2 2 2.5-2.5 2 2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
