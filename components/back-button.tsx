"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/icons";

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
    // Back/forward navigation always reuses the client router cache, even
    // for dynamic routes, so data changed while away (e.g. saving an API
    // key in Settings) wouldn't otherwise show up until a hard reload.
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Back to chat"
      className="-ml-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-neutral-500 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <BackIcon />
    </button>
  );
}
