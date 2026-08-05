"use client";

import { useRouter } from "next/navigation";
import { EditableTitle } from "@/components/editable-title";
import { createClient } from "@/lib/supabase/client";

export function ProjectTitle({ projectId, name }: { projectId: string; name: string }) {
  const router = useRouter();

  async function handleSave(next: string) {
    const supabase = createClient();
    await supabase.from("projects").update({ name: next }).eq("id", projectId);
    router.refresh();
  }

  return <EditableTitle value={name} onSave={handleSave} />;
}
