const HOUR = 3600_000;
const RANGE_MS: Record<string, number> = { "1h": HOUR, "24h": 24 * HOUR, "7d": 7 * 24 * HOUR, "30d": 30 * 24 * HOUR };

export function rangeStart(range: string | undefined): string | undefined {
  const span = range ? RANGE_MS[range] : undefined;
  return span ? new Date(Date.now() - span).toISOString() : undefined;
}
