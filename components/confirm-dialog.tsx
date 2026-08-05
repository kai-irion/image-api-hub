"use client";

import { Modal } from "@/components/modal";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isConfirming,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel}>
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          disabled={isConfirming}
          onClick={onCancel}
          className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 active:scale-[0.98] disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={isConfirming}
          onClick={onConfirm}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
        >
          {isConfirming ? "Deleting..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
