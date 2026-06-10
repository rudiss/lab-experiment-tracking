// FormData parsing helpers for Server Actions.

export function getStr(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function getOptStr(fd: FormData, key: string): string | null {
  const v = getStr(fd, key);
  return v === "" ? null : v;
}

export function getInt(fd: FormData, key: string): number {
  return Number(getStr(fd, key));
}

export function getOptInt(fd: FormData, key: string): number | null {
  const v = getStr(fd, key);
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function getOptDate(fd: FormData, key: string): Date | null {
  const v = getStr(fd, key);
  if (v === "") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getBool(fd: FormData, key: string): boolean {
  return fd.get(key) != null;
}

/** Parse a comma- or newline-separated list into trimmed, non-empty values. */
export function getList(fd: FormData, key: string): string[] {
  return getStr(fd, key)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Format a Date as YYYY-MM-DD for <input type="date"> defaults. */
export function toDateInput(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

/** Format a Date as YYYY-MM-DDTHH:mm (local) for <input type="datetime-local">. */
export function toDateTimeInput(d: Date | null | undefined): string {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}
