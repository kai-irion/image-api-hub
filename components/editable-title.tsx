"use client";

import { useEffect, useRef, useState } from "react";
import { PencilIcon } from "@/components/icons";

export function EditableTitle({
  value,
  onSave,
  textClassName = "text-sm font-medium text-neutral-700 dark:text-neutral-200",
}: {
  value: string;
  onSave: (next: string) => Promise<void> | void;
  textClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  async function submit() {
    const trimmed = draft.trim();
    setIsEditing(false);
    if (!trimmed || trimmed === value) {
      setDraft(value);
      return;
    }
    await onSave(trimmed);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={submit}
        onKeyDown={(event) => {
          if (event.key === "Enter") submit();
          if (event.key === "Escape") {
            setDraft(value);
            setIsEditing(false);
          }
        }}
        className={`rounded-md bg-white px-2 py-0.5 outline-none ring-1 ring-neutral-300 transition dark:bg-neutral-900 dark:ring-neutral-700 ${textClassName}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="group/title flex items-center gap-1.5 rounded-md px-1 py-0.5 text-left transition-colors duration-150 hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <span className={textClassName}>{value}</span>
      <PencilIcon
        size={12}
        className="text-neutral-400 opacity-0 transition-opacity duration-150 group-hover/title:opacity-100"
      />
    </button>
  );
}
