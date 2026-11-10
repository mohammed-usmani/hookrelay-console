import { absolute, outcome } from "@/lib/format";
import type { Attempt, Delivery } from "@/lib/types";

/**
 * Every attempt placed on the delivery's retry window. Retries back off from seconds to hours,
 * so the axis is logarithmic: the first minute gets as much room as the last day.
 */
const UNIT_S = 5;
const TICKS: [number, string][] = [
  [0, "Created"],
  [60, "1 min"],
  [3600, "1 h"],
  [6 * 3600, "6 h"],
  [24 * 3600, "1 day"],
  [2 * 24 * 3600, "2 days"],
];

export function RetryTimeline({ delivery, attempts, now }: { delivery: Delivery; attempts: Attempt[]; now: number }) {
  const start = new Date(delivery.createdAt).getTime();
  const windowS = Math.max(60, (new Date(delivery.deadlineAt).getTime() - start) / 1000);
  const x = (iso: string | number) => {
    const t = Math.max(0, ((typeof iso === "number" ? iso : new Date(iso).getTime()) - start) / 1000);
    return Math.min(1, Math.log1p(t / UNIT_S) / Math.log1p(windowS / UNIT_S)) * 100;
  };
  const final = delivery.status === "SUCCEEDED" || delivery.status === "DEAD";
  const lastAt = attempts.length ? new Date(attempts[attempts.length - 1].startedAt).getTime() : start;
  const progressEnd = final ? lastAt : now;

  return (
    <figure className="px-4 pt-5 pb-3">
      <div className="relative mx-2 h-10">
        {/* window */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        <div className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full bg-foreground/25" style={{ width: `${x(progressEnd)}%` }} />
        {!final && (
          <div className="absolute top-1 bottom-1 w-px bg-primary" style={{ left: `${x(now)}%` }} title="Now">
            <span className="absolute -top-4 -translate-x-1/2 text-[0.7rem] font-medium text-primary">Now</span>
          </div>
        )}
        {attempts.map((a) => {
          const ok = a.outcome === "SUCCESS";
          return (
            <span
              key={a.id}
              className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card ${ok ? "bg-ok" : "bg-bad"}`}
              style={{ left: `${x(a.startedAt)}%` }}
              title={`Attempt ${a.attemptNo}: ${outcome(a.outcome)}${a.responseStatus ? ` (${a.responseStatus})` : ""}, ${absolute(a.startedAt)}`}
            />
          );
        })}
        {delivery.nextAttemptAt && !final && (
          <span
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-warn bg-card"
            style={{ left: `${x(delivery.nextAttemptAt)}%` }}
            title={`Next attempt ${absolute(delivery.nextAttemptAt)}`}
          />
        )}
      </div>
      <div className="relative mx-2 h-5 text-[0.7rem] text-muted-foreground" aria-hidden>
        {/* on a log axis late ticks bunch up at the end; keep clear of the "Gives up" label */}
        {TICKS.filter(([s]) => x(start + s * 1000) <= 90).map(([s, label]) => (
          <span key={s} className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0" style={{ left: `${x(start + s * 1000)}%` }}>
            {label}
          </span>
        ))}
        <span className="absolute right-0 whitespace-nowrap">Gives up</span>
      </div>
      <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <Legend className="bg-ok">Delivered</Legend>
        <Legend className="bg-bad">Failed attempt</Legend>
        {!final && delivery.nextAttemptAt && <Legend className="border-2 border-dashed border-warn">Next attempt</Legend>}
        <span>Retries back off from seconds to hours, for up to {Math.round(windowS / 86400)} days.</span>
      </figcaption>
    </figure>
  );
}

function Legend({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2.5 rounded-full ${className}`} />
      {children}
    </span>
  );
}
