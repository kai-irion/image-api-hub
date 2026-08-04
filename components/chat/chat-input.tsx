"use client";

import { useRef, useState } from "react";

export function ChatInput() {
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!value.trim() && !attachment) return;
    // Sending is not wired up yet — this is placeholder UI.
    setValue("");
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-neutral-200 p-4 dark:border-neutral-800"
    >
      {attachment && (
        <div className="mb-2 flex w-fit items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          <span className="truncate max-w-[12rem]">{attachment.name}</span>
          <button
            type="button"
            onClick={() => {
              setAttachment(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-100"
            aria-label="Remove attachment"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 rounded-xl border border-neutral-300 bg-white p-2 focus-within:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          aria-label="Attach image"
        >
          <AttachIcon />
        </button>

        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
          rows={1}
          placeholder="Describe an image, or ask to edit the attached one..."
          className="max-h-40 flex-1 resize-none bg-transparent px-1 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100"
        />

        <button
          type="submit"
          disabled={!value.trim() && !attachment}
          className="shrink-0 rounded-lg bg-neutral-900 p-2 text-white transition hover:bg-neutral-700 disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
}

function AttachIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10.5 5.5 6 10a1.8 1.8 0 1 0 2.5 2.5l4.5-4.5a3.2 3.2 0 0 0-4.5-4.5L4 7.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M14 2 7 9M14 2 9.5 14l-2.5-5L2 6.5 14 2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
