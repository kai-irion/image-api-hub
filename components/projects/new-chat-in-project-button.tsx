"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

export function NewChatInProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  async function handleClick() {
    if (isCreating) return;
    setIsCreating(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("chats")
      .insert({ title: "New chat", project_id: projectId })
      .select("id")
      .single();

    setIsCreating(false);
    if (error || !data) return;

    router.push(`/chat/${data.id}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isCreating}
      className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
    >
      <PlusIcon size={14} />
      New chat
    </button>
  );
}
