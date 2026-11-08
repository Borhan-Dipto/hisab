const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Converts Bangla digits (০-৯) to ASCII digits, leaving everything else alone. */
export function toAsciiDigits(input: string): string {
  return input.replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d)));
}

/**
 * Parses money as couriers and shops write it: "৳1,250", "Tk. 1250.50", "১২৫০", "(80)" or "-80".
 * Returns 0 for empty cells and NaN for text that is not a number.
 */
export function parseTaka(value: unknown): number {
  if (typeof value === "number") return value;
  if (value === null || value === undefined) return 0;
  let s = toAsciiDigits(String(value)).trim();
  if (s === "" || s === "-") return 0;
  const negative = /^\(.*\)$/.test(s) || s.startsWith("-");
  s = s.replace(/[()\s,]/g, "").replace(/^-/, "").replace(/^(৳|tk\.?|bdt|taka)/i, "").replace(/(৳|tk\.?|bdt|taka)$/i, "");
  if (!/^\d+(\.\d+)?$/.test(s)) return Number.NaN;
  const n = Number(s);
  return negative ? -n : n;
}

/**
 * Normalises a Bangladeshi mobile number to the 11-digit local form (01XXXXXXXXX).
 * Accepts +8801..., 8801..., 01..., 1XXXXXXXXX, with spaces or dashes, in Bangla or ASCII digits.
 * Returns undefined when the input is not a valid BD mobile number.
 */
export function normalizePhone(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  let d = toAsciiDigits(String(value)).replace(/\D/g, "");
  if (d.startsWith("880")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("1")) d = "0" + d;
  return /^01[3-9]\d{8}$/.test(d) ? d : undefined;
}

/** Normalises an id for matching: trims, uppercases and drops spaces and a leading "#". */
export function normalizeId(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = toAsciiDigits(String(value)).trim().replace(/^#/, "").replace(/\s+/g, "").toUpperCase();
  return s === "" ? undefined : s;
}

/** Rounds to paisa so floating-point noise never shows up as a difference. */
export function roundTaka(n: number): number {
  return Math.round(n * 100) / 100;
}
