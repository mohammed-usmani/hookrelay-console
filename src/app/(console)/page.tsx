import { AlertTriangle, ArrowRight, CircleCheck, Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DeliveryTable } from "@/components/delivery-table";
import { EmptyState, PageHeader, Panel, Section } from "@/components/page-header";
import { CircuitPill, EndpointStatusPill, circuitHelp } from "@/components/status";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api";
import { allEndpoints, allEventTypes } from "@/lib/data";
import { rangeStart } from "@/lib/ranges";
import type { Delivery, Page } from "@/lib/types";

export const metadata: Metadata = { title: "Overview" };

const count = (p: Page<unknown>) => (p.nextCursor ? `${p.data.length}+` : String(p.data.length));

export default async function Overview() {
  const dayAgo = rangeStart("24h");
  const [endpoints, types, retrying, failed, delivered] = await Promise.all([
    allEndpoints(),
    allEventTypes(),
    api<Page<Delivery>>("/v1/deliveries", { query: { status: "FAILED_RETRYING", limit: 100 } }),
    api<Page<Delivery>>("/v1/deliveries", { query: { status: "DEAD", from: dayAgo, limit: 100 } }),
    api<Page<Delivery>>("/v1/deliveries", { query: { status: "SUCCEEDED", from: dayAgo, limit: 100 } }),
  ]);
  const byId = new Map(endpoints.map((e) => [e.id, e]));
  const attention = endpoints.filter((e) => e.status !== "ACTIVE" || e.circuitState !== "CLOSED");
  const customTypes = types.filter((t) => !t.system);

  if (endpoints.length === 0 || customTypes.length === 0) {
    return (
      <>
        <PageHeader title="Overview" description="Set up this application to start sending webhooks." />
        <GettingStarted hasTypes={customTypes.length > 0} hasEndpoints={endpoints.length > 0} />
      </>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Overview" description="Delivery health for this application over the last 24 hours." />

      <dl className="grid grid-cols-2 divide-border overflow-hidden rounded-lg border bg-card sm:grid-cols-4 sm:divide-x">
        <Stat label="Active endpoints" value={`${endpoints.filter((e) => e.status === "ACTIVE").length} of ${endpoints.length}`} href="/endpoints" />
        <Stat label="Delivered" value={count(delivered)} href="/deliveries?status=SUCCEEDED" />
        <Stat label="Retrying now" value={count(retrying)} href="/deliveries?status=FAILED_RETRYING" tone={retrying.data.length ? "warn" : undefined} />
        <Stat label="Failed" value={count(failed)} href="/deliveries?status=DEAD" tone={failed.data.length ? "bad" : undefined} />
      </dl>

      <Section title="Endpoints needing attention">
        {attention.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleCheck className="size-4 text-ok" /> Every endpoint is active and receiving deliveries.
          </p>
        ) : (
          <Panel>
            <ul className="divide-y">
              {attention.map((e) => (
                <li key={e.id} className="relative flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-muted/50">
                  <AlertTriangle className="size-4 text-warn" />
                  <Link href={`/endpoints/${e.id}`} className="min-w-0 flex-1 truncate font-mono text-[0.8rem] after:absolute after:inset-0">
                    {e.url}
                  </Link>
                  <span className="hidden text-sm text-muted-foreground lg:inline">
                    {e.status === "DISABLED"
                      ? "Disabled after failing for 3 days. Resume it once the receiver is fixed."
                      : e.status === "PAUSED"
                        ? "Paused. Events are kept and sent when you resume."
                        : circuitHelp(e.circuitState)}
                  </span>
                  {e.status !== "ACTIVE" ? <EndpointStatusPill status={e.status} /> : <CircuitPill state={e.circuitState} />}
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </Section>

      <Section
        title="Recent failures"
        description="Deliveries that ran out of retries in the last 24 hours. Open one to see every attempt and send it again."
        actions={
          failed.data.length > 0 && (
            <Link href="/deliveries?status=DEAD" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View all <ArrowRight />
            </Link>
          )
        }
      >
        {failed.data.length === 0 ? (
          <EmptyState icon={Inbox} title="No failed deliveries">
            Every event in the last 24 hours reached its endpoints or is still being retried.
          </EmptyState>
        ) : (
          <Panel>
            <DeliveryTable deliveries={failed.data.slice(0, 8)} endpoints={byId} />
          </Panel>
        )}
      </Section>
    </div>
  );
}

function Stat({ label, value, href, tone }: { label: string; value: string; href: string; tone?: "warn" | "bad" }) {
  return (
    <Link href={href} className="group border-b px-4 py-3 hover:bg-muted/50 sm:border-b-0 [&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:border-r-0">
      <dt className="text-sm text-muted-foreground group-hover:text-foreground">{label}</dt>
      <dd className={`mt-1 text-2xl font-semibold tabular-nums ${tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : ""}`}>{value}</dd>
    </Link>
  );
}

function GettingStarted({ hasTypes, hasEndpoints }: { hasTypes: boolean; hasEndpoints: boolean }) {
  const steps = [
    { done: hasTypes, title: "Define an event type", body: "Name the things that happen in your product, like order.created. A JSON schema is optional.", href: "/event-types", cta: "Add event type" },
    { done: hasEndpoints, title: "Add an endpoint", body: "The URL that should receive webhooks, and which event types it wants.", href: "/endpoints", cta: "Add endpoint" },
    { done: false, title: "Send an event", body: "Post an event from your backend or from the Events page. HookRelay signs it and delivers it to every subscribed endpoint.", href: "/events", cta: "Send event" },
  ];
  const current = steps.findIndex((s) => !s.done);
  return (
    <Panel>
      <ol className="divide-y">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4 px-5 py-4">
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium ${s.done ? "bg-ok/15 text-ok" : i === current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {s.done ? <CircleCheck className="size-3.5" /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${s.done ? "text-muted-foreground line-through" : ""}`}>{s.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{s.body}</p>
            </div>
            {i === current && (
              <Link href={s.href} className={buttonVariants({ size: "sm" })}>
                {s.cta}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </Panel>
  );
}
