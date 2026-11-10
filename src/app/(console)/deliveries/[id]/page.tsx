import { ChevronRight, RotateCcw } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { replayDelivery } from "@/app/(console)/actions";
import { ActionButton } from "@/components/action-button";
import { Id } from "@/components/copy-button";
import { PageHeader, Panel, Section } from "@/components/page-header";
import { RetryTimeline } from "@/components/retry-timeline";
import { DeliveryStatusPill, Pill } from "@/components/status";
import { Time } from "@/components/time";
import { ApiError, api } from "@/lib/api";
import { deadReason, ms, outcome } from "@/lib/format";
import type { Attempt, Delivery, Endpoint, Event, Page } from "@/lib/types";

export const metadata: Metadata = { title: "Delivery" };

async function load(id: string) {
  try {
    const delivery = await api<Delivery>(`/v1/deliveries/${id}`);
    const [attempts, endpoint, event] = await Promise.all([
      api<Page<Attempt>>(`/v1/deliveries/${id}/attempts`),
      api<Endpoint>(`/v1/endpoints/${delivery.endpointId}`).catch(() => null),
      api<Event>(`/v1/events/${delivery.eventId}`),
    ]);
    return { now: Date.now(), delivery, attempts: attempts.data.toSorted((a, b) => a.attemptNo - b.attemptNo), endpoint, event };
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }
}

export default async function DeliveryPage({ params }: PageProps<"/deliveries/[id]">) {
  const { id } = await params;
  const { now, delivery, attempts, endpoint, event } = await load(id);
  const final = delivery.status === "SUCCEEDED" || delivery.status === "DEAD";

  return (
    <div className="space-y-8">
      <PageHeader
        crumbs={[{ href: "/deliveries", label: "Deliveries" }]}
        title={
          <span className="flex items-center gap-3">
            <span className="font-mono">{event.eventType}</span>
            <DeliveryStatusPill status={delivery.status} />
          </span>
        }
        meta={
          <>
            <span className="text-muted-foreground">
              Created <Time iso={delivery.createdAt} />
            </span>
            <Id value={delivery.id} />
          </>
        }
        actions={
          final && (
            <ActionButton
              variant={delivery.status === "DEAD" ? "default" : "outline"}
              action={replayDelivery.bind(null, delivery.id)}
              disabled={event.payloadPurged || !endpoint}
              title={event.payloadPurged ? "The payload was removed by retention, so it can't be sent again." : !endpoint ? "The endpoint was deleted." : undefined}
            >
              <RotateCcw /> Send again
            </ActionButton>
          )
        }
      />

      <Panel>
        <dl className="grid divide-y text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Summary label="Endpoint">
            {endpoint ? (
              <Link href={`/endpoints/${endpoint.id}`} className="block truncate font-mono text-[0.8rem] hover:underline">
                {endpoint.url}
              </Link>
            ) : (
              <span className="text-muted-foreground">Deleted endpoint</span>
            )}
          </Summary>
          <Summary label="Event">
            <Link href={`/events/${event.id}`} className="inline-flex items-center gap-1 hover:underline">
              <span className="font-mono text-[0.8rem]">{event.id.slice(0, 8)}</span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
          </Summary>
          <Summary label={delivery.status === "DEAD" ? "Why it failed" : delivery.status === "SUCCEEDED" ? "Result" : "Next attempt"}>
            {delivery.status === "DEAD" ? (
              <span className="text-bad">{deadReason(delivery.deadReason)}</span>
            ) : delivery.status === "SUCCEEDED" ? (
              `Delivered after ${delivery.attemptCount} ${delivery.attemptCount === 1 ? "attempt" : "attempts"}`
            ) : (
              <Time iso={delivery.nextAttemptAt} />
            )}
          </Summary>
        </dl>
        <div className="border-t">
          <RetryTimeline delivery={delivery} attempts={attempts} now={now} />
        </div>
      </Panel>

      <Section title={`Attempts (${attempts.length})`} description={attempts.length ? "Newest last. Open an attempt to see what the receiver returned." : undefined}>
        {attempts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attempts yet. The first one is made within seconds of the event.</p>
        ) : (
          <Panel>
            <ol className="divide-y">
              {attempts.map((a) => (
                <li key={a.id}>
                  <details className="group" open={a === attempts[attempts.length - 1] && a.outcome !== "SUCCESS"}>
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" />
                      <span className="w-20 text-muted-foreground">Attempt {a.attemptNo}</span>
                      <Pill tone={a.outcome === "SUCCESS" ? "ok" : "bad"}>{outcome(a.outcome)}</Pill>
                      {a.responseStatus !== null && <code className="font-mono text-[0.8rem]">HTTP {a.responseStatus}</code>}
                      <span className="ml-auto flex gap-4 text-muted-foreground tabular-nums">
                        <span>{ms(a.durationMs)}</span>
                        <Time iso={a.startedAt} />
                      </span>
                    </summary>
                    <div className="space-y-3 border-t bg-muted/30 px-4 py-3 pl-12 text-sm">
                      {a.error && (
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted-foreground">Error</p>
                          <p className="font-mono text-[0.8rem] break-all">{a.error}</p>
                        </div>
                      )}
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Response body</p>
                        {a.responseSnippet ? (
                          <pre className="max-h-64 overflow-auto rounded-md border bg-card p-3 font-mono text-[0.8rem] whitespace-pre-wrap break-all">{a.responseSnippet}</pre>
                        ) : (
                          <p className="text-muted-foreground">Empty</p>
                        )}
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          </Panel>
        )}
      </Section>
    </div>
  );
}

function Summary({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 px-4 py-3">
      <dt className="mb-1 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
