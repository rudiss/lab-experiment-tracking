"use client";

import { useTransition } from "react";
import { buttonClasses } from "@/components/ui";

/**
 * Confirms, then calls a server action. The action is passed in already bound to
 * the record id (action.bind(null, id)). On error (e.g. a RESTRICT foreign key),
 * the message is shown inline rather than crashing the page.
 */
export function DeleteButton({
  action,
  label = "Delete",
  confirmMessage = "Delete this record? This cannot be undone.",
  variant = "danger",
}: {
  action: () => Promise<{ error?: string } | void>;
  label?: string;
  confirmMessage?: string;
  variant?: "danger" | "ghost" | "secondary";
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action();
      if (result?.error) alert(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={buttonClasses(variant, "text-xs px-2 py-1")}
    >
      {pending ? "…" : label}
    </button>
  );
}
