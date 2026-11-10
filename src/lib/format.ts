const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["second", 60],
  ["minute", 60],
  ["hour", 24],
  ["day", 30],
  ["month", 12],
  ["year", Infinity],
];

export function relative(iso: string, now = Date.now()): string {
  let v = (new Date(iso).getTime() - now) / 1000;
  if (Math.abs(v) < 10) return "just now";
  for (const [unit, size] of STEPS) {
    if (Math.abs(v) < size) return rtf.format(Math.round(v), unit);
    v /= size;
  }
  return iso;
}

export function absolute(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

export function ms(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n < 1000) return `${Math.round(n)} ms`;
  return `${(n / 1000).toFixed(n < 10_000 ? 2 : 1)} s`;
}

export function percent(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `${(n * 100).toFixed(n === 1 ? 0 : 1)}%`;
}

export function shortId(id: string): string {
  return id.slice(0, 8);
}

const DEAD_REASONS: Record<string, string> = {
  retries_exhausted: "Every retry failed",
  expired: "Retry window ran out",
  payload_purged: "Payload was removed by retention",
  endpoint_deleted: "Endpoint was deleted",
  endpoint_disabled: "Endpoint was disabled",
};
export function deadReason(r: string | null): string | null {
  return r ? (DEAD_REASONS[r] ?? r.replaceAll("_", " ")) : null;
}

const OUTCOMES: Record<string, string> = {
  SUCCESS: "Delivered",
  HTTP_ERROR: "Error response",
  REDIRECT: "Redirect (not followed)",
  TIMEOUT: "Timed out",
  CONNECTION_ERROR: "Could not connect",
  TLS_ERROR: "TLS handshake failed",
  SSRF_BLOCKED: "Blocked private address",
};
export function outcome(o: string): string {
  return OUTCOMES[o] ?? o;
}
