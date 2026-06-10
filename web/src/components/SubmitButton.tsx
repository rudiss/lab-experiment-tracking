"use client";

import { useFormStatus } from "react-dom";
import { buttonClasses } from "@/components/ui";

export function SubmitButton({
  children = "Save",
  variant = "primary",
  className,
}: {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClasses(variant, className)}>
      {pending ? "Saving…" : children}
    </button>
  );
}
