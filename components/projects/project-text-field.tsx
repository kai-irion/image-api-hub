"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SaveState = "idle" | "saving" | "saved";

export function ProjectTextField({
  projectId,
  field,
  label,
  placeholder,
  helperText,
  initialValue,
}: {
  projectId: string;
  field: "description" | "instructions";
  label: string;
  placeholder: string;
  helperText?: string;
  initialValue: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const isDirty = value !== initialValue;

  async function handleSave() {
    setSaveState("saving");
    const supabase = createClient();
    await supabase
      .from("projects")
      .update({ [field]: value.trim() || null })
      .eq("id", projectId);
    setSaveState("saved");
    router.refresh();
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{label}</h2>
      {helperText && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{helperText}</p>
      )}
      <textarea
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSaveState("idle");
        }}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 focus:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || saveState === "saving"}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          {saveState === "saving" ? "Saving..." : "Save"}
        </button>
        {saveState === "saved" && !isDirty && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400">Saved</span>
        )}
      </div>
    </section>
  );
}
