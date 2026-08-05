"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrashIcon } from "@/components/icons";
import { Modal } from "@/components/modal";
import { createClient } from "@/lib/supabase/client";

export function DeleteProjectButton({
  projectId,
  projectName,
  chatCount,
}: {
  projectId: string;
  projectName: string;
  chatCount: number;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm(deleteChatsToo: boolean) {
    setIsDeleting(true);
    const supabase = createClient();

    if (deleteChatsToo) {
      await supabase.from("chats").delete().eq("project_id", projectId);
    }
    // Chats left referencing this project automatically become ungrouped
    // (project_id set to null) via the FK's ON DELETE SET NULL.
    await supabase.from("projects").delete().eq("id", projectId);

    setIsDeleting(false);
    setDialogOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        aria-label="Delete project"
        className="rounded-md p-1.5 text-neutral-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
      >
        <TrashIcon />
      </button>

      <Modal open={dialogOpen} onClose={() => !isDeleting && setDialogOpen(false)}>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Delete &quot;{projectName}&quot;?
        </h3>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {chatCount === 0
            ? "This project has no chats."
            : `This project has ${chatCount} chat${chatCount === 1 ? "" : "s"}. Choose what to do with ${
                chatCount === 1 ? "it" : "them"
              }.`}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => handleConfirm(false)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {chatCount > 0 ? "Move chats to top level, then delete" : "Delete project"}
          </button>
          {chatCount > 0 && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => handleConfirm(true)}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
            >
              Delete chats too
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={isDeleting}
          onClick={() => setDialogOpen(false)}
          className="mt-3 w-full rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 transition-colors duration-150 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
      </Modal>
    </>
  );
}
