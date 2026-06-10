// Small presentation helpers shared across pages.

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** "ACTIVE" -> "Active", "PCR Result" stays as-is. */
export function enumLabel(value: string): string {
  if (value !== value.toUpperCase()) return value;
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type BadgeColor = "green" | "blue" | "amber" | "red" | "gray" | "purple";

export function statusColor(status: string): BadgeColor {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "COMPLETED":
      return "blue";
    case "PLANNING":
      return "amber";
    case "CANCELLED":
      return "red";
    default:
      return "gray";
  }
}

export function valueKindColor(kind: string): BadgeColor {
  switch (kind) {
    case "NUMERIC":
      return "blue";
    case "CATEGORICAL":
      return "purple";
    case "TEXT":
      return "gray";
    default:
      return "gray";
  }
}

/** Render a measurement's value with its unit, regardless of kind. */
export function measurementValue(m: {
  valueKind: string;
  numericValue: unknown;
  unit: string | null;
  categoricalValue: string | null;
  textValue: string | null;
}): string {
  switch (m.valueKind) {
    case "NUMERIC": {
      const n = m.numericValue == null ? "" : String(m.numericValue);
      return m.unit ? `${n} ${m.unit}` : n;
    }
    case "CATEGORICAL":
      return m.categoricalValue ?? "";
    case "TEXT":
      return m.textValue ?? "";
    default:
      return "";
  }
}
