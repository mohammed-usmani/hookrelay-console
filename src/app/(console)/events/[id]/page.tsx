import { Archive } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Id } from "@/components/copy-button";
import { DeliveryTable } from "@/components/delivery-table";
import { JsonBlock } from "@/components/json-block";
import { PageHeader, Panel, Section } from "@/components/page-header";
import { Time } from "@/components/time";
import { ApiError, api } from "@/lib/api";
import { endpointMap } from "@/lib/data";
import type { Delivery, Event, Page } from "@/lib/types";

export const metadata: Metadata = { title: "Event" };

async function load(id: string) {
  try {
    return await Promise.all([api<Event>(`/v1/events/${id}`), api<Page<Delivery>>(`/v1/events/${id}/deliveries`), endpointMap()]);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }
}

export default async function EventPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const [event, deliveries, endpoints] = await load(id);
  return (
    <div className="space-y-8">
      <PageHeader
        crumbs={[{ href: "/events", label: "Events" }]}
        title={<span className="font-mono">{event.eventType}</span>}
        meta={
          <>
            <span className="text-muted-foreground">
              Sent <Time iso={event.createdAt} />
            </span>
            <Id value={event.id} />
          </>
        }
      />
      <Section
        title={`Deliveries (${deliveries.data.length})`}
        description={deliveries.data.length === 0 ? "No endpoint was subscribed to this event type when it was sent." : undefined}
      >
        {deliveries.data.length > 0 && (
          <Panel>
            <DeliveryTable deliveries={deliveries.data} endpoints={endpoints} hide={["event"]} />
          </Panel>
        )}
      </Section>
      <Section title="Payload">
        {event.payloadPurged ? (
          <p className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            <Archive className="size-4" /> The payload was removed by the retention policy. Delivery history is kept.
          </p>
        ) : (
          <JsonBlock value={event.payload} />
        )}
      </Section>
    </div>
  );
}
