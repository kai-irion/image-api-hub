"use client";

import { useRouter } from "next/navigation";
import { EditableTitle } from "@/components/editable-title";
import { createClient } from "@/lib/supabase/client";

export function ChatTitle({ chatId, title }: { chatId: string; title: string }) {
  const router = useRouter();

  async function handleSave(next: string) {
    const supabase = createClient();
    await supabase.from("chats").update({ title: next }).eq("id", chatId);
    router.refresh();
  }

  return <EditableTitle value={title} onSave={handleSave} />;
}
