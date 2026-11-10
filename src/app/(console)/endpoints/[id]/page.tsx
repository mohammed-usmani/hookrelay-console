import { AlertTriangle, ArrowRight, PauseCircle, SendHorizontal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Id } from "@/components/copy-button";
import { DeliveryTable } from "@/components/delivery-table";
import {
  DeleteEndpointButton,
  PauseResumeButton,
  ReplayButton,
  SendTestButton,
  SigningSecret,
} from "@/components/endpoint-actions";
import { EndpointForm } from "@/components/endpoint-form";
import { EmptyState, PageHeader, Panel, Section } from "@/components/page-header";
import { CircuitPill, DELIVERY_LABELS, EndpointStatusPill, circuitHelp } from "@/components/status";
import { Time } from "@/components/time";
import { Toast } from "@/components/toast-on-load";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api";
import { allEventTypes } from "@/lib/data";
import { ms, percent } from "@/lib/format";
import type { Delivery, DeliveryStatus, Endpoint, EndpointStats, Page } from "@/lib/types";

export const metadata: Metadata = { title: "Endpoint" };

async function load(id: string) {
  try {
    return await Promise.all([
      api<Endpoint>(`/v1/endpoints/${id}`),
      api<EndpointStats>(`/v1/endpoints/${id}/stats`),
      api<Page<Delivery>>("/v1/deliveries", { query: { endpointId: id, limit: 15 } }),
      allEventTypes(),
    ]);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }
}

export default async function EndpointPage({ params, searchParams }: PageProps<"/endpoints/[id]">) {
  const { id } = await params;
  const { created } = await searchParams;
  const [endpoint, stats, deliveries, types] = await load(id);

  return (
    <div className="space-y-8">
      {created && <Toast message="Endpoint added" />}
      <PageHeader
        crumbs={[{ href: "/endpoints", label: "Endpoints" }]}
        title={<span className="font-mono text-lg">{endpoint.url}</span>}
        description={endpoint.description}
        meta={
          <>
            <EndpointStatusPill status={endpoint.status} />
            {endpoint.status === "ACTIVE" && <CircuitPill state={endpoint.circuitState} />}
            <span className="text-muted-foreground">
              Added <Time iso={endpoint.createdAt} />
            </span>
            <Id value={endpoint.id} />
          </>
        }
        actions={
          <>
            <SendTestButton id={endpoint.id} />
            <ReplayButton id={endpoint.id} />
            <EndpointForm types={types} endpoint={endpoint} />
            <PauseResumeButton endpoint={endpoint} />
          </>
        }
      />

      <StatusNotice endpoint={endpoint} />

      <Section title="Last 24 hours">
        <Panel>
          <dl className="grid grid-cols-2 sm:grid-cols-4 sm:divide-x">
            <Metric label="Success rate" value={percent(stats.successRate)} sub={`${stats.successes} of ${stats.attempts} attempts`} />
            <Metric label="Median response" value={ms(stats.p50Ms)} />
            <Metric label="95th percentile" value={ms(stats.p95Ms)} />
            <Metric label="Last success" value={stats.lastSuccessAt ? <Time iso={stats.lastSuccessAt} /> : "Never"} />
          </dl>
          <StatusBar counts={stats.deliveriesByStatus} endpointId={endpoint.id} />
        </Panel>
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Signing secret" description="Verify the webhook-signature header with this secret to confirm a request came from HookRelay.">
          <SigningSecret id={endpoint.id} />
        </Section>
        <Section title="Configuration">
          <dl className="divide-y rounded-lg border text-sm">
            <Row label="Receives">
              {endpoint.eventTypes.length === 0 ? (
                "All event types"
              ) : (
                <span className="flex flex-wrap gap-1">
                  {endpoint.eventTypes.map((t) => (
                    <code key={t} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {t}
                    </code>
                  ))}
                </span>
              )}
            </Row>
            <Row label="Rate limit">{endpoint.rateLimitPerSec ? `${endpoint.rateLimitPerSec} per second` : "No limit"}</Row>
            <Row label="Last changed">
              <Time iso={endpoint.updatedAt} />
            </Row>
          </dl>
        </Section>
      </div>

      <Section
        title="Recent deliveries"
        actions={
          deliveries.nextCursor && (
            <Link href={`/deliveries?endpointId=${endpoint.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View all <ArrowRight />
            </Link>
          )
        }
      >
        {deliveries.data.length === 0 ? (
          <EmptyState icon={SendHorizontal} title="Nothing delivered yet" action={<SendTestButton id={endpoint.id} />}>
            Send a test event to check that the receiver accepts and verifies requests.
          </EmptyState>
        ) : (
          <Panel>
            <DeliveryTable deliveries={deliveries.data} endpoints={new Map([[endpoint.id, endpoint]])} hide={["endpoint"]} />
          </Panel>
        )}
      </Section>

      <Section title="Delete endpoint" description="Stops all deliveries to this URL. Delivery history stays available.">
        <div>
          <DeleteEndpointButton id={endpoint.id} />
        </div>
      </Section>
    </div>
  );
}

function StatusNotice({ endpoint }: { endpoint: Endpoint }) {
  const notice =
    endpoint.status === "DISABLED"
      ? { icon: AlertTriangle, tone: "border-bad/30 bg-bad/5 text-bad", title: "Disabled after 3 days of failures", body: "New events are not delivered to this endpoint. Fix the receiver, then resume. Replay failed deliveries to catch up." }
      : endpoint.status === "PAUSED"
        ? { icon: PauseCircle, tone: "border-border bg-muted/50 text-foreground", title: "Paused", body: "Events are kept and will be delivered when you resume." }
        : endpoint.circuitState !== "CLOSED"
          ? { icon: AlertTriangle, tone: "border-warn/30 bg-warn/5 text-warn", title: endpoint.circuitState === "OPEN" ? "Deliveries are on hold" : "Checking if the endpoint recovered", body: circuitHelp(endpoint.circuitState) }
          : null;
  if (!notice) return null;
  const Icon = notice.icon;
  return (
    <div role="status" className={`flex gap-3 rounded-lg border px-4 py-3 ${notice.tone}`}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="text-sm">
        <p className="font-medium">{notice.title}</p>
        <p className="text-muted-foreground">{notice.body}</p>
      </div>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="border-b px-4 py-3 sm:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
      {sub && <dd className="text-xs text-muted-foreground">{sub}</dd>}
    </div>
  );
}

const BAR: [DeliveryStatus, string][] = [
  ["SUCCEEDED", "bg-ok"],
  ["PENDING", "bg-primary/60"],
  ["FAILED_RETRYING", "bg-warn"],
  ["DEAD", "bg-bad"],
];

function StatusBar({ counts, endpointId }: { counts: Record<DeliveryStatus, number>; endpointId: string }) {
  const total = BAR.reduce((n, [s]) => n + (counts[s] ?? 0), 0);
  if (total === 0) return <p className="border-t px-4 py-3 text-sm text-muted-foreground">No deliveries in this window.</p>;
  return (
    <div className="space-y-2 border-t px-4 py-3">
      <div className="flex h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label="Deliveries by status">
        {BAR.map(([s, c]) => (counts[s] ? <div key={s} className={c} style={{ width: `${(counts[s] / total) * 100}%` }} /> : null))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        {BAR.map(([s, c]) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${c}`} />
            <Link href={`/deliveries?endpointId=${endpointId}&status=${s}`} className="hover:text-foreground">
              {DELIVERY_LABELS[s]} <span className="font-medium text-foreground tabular-nums">{counts[s] ?? 0}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-4 px-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
