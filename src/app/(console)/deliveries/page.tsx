import { SendHorizontal } from "lucide-react";
import type { Metadata } from "next";
import { DeliveryTable } from "@/components/delivery-table";
import { FilterBar, RANGES } from "@/components/filter-bar";
import { EmptyState, PageHeader, Panel } from "@/components/page-header";
import { Pager, param } from "@/components/pager";
import { DELIVERY_LABELS } from "@/components/status";
import { api } from "@/lib/api";
import { allEndpoints } from "@/lib/data";
import { rangeStart } from "@/lib/ranges";
import type { Delivery, Page } from "@/lib/types";

export const metadata: Metadata = { title: "Deliveries" };

export default async function DeliveriesPage({ searchParams }: PageProps<"/deliveries">) {
  const sp = await searchParams;
  const filters = {
    status: param(sp, "status"),
    endpointId: param(sp, "endpointId"),
    eventId: param(sp, "eventId"),
    range: param(sp, "range"),
    cursor: param(sp, "cursor"),
  };
  const [page, endpoints] = await Promise.all([
    api<Page<Delivery>>("/v1/deliveries", {
      query: { status: filters.status, endpointId: filters.endpointId, eventId: filters.eventId, from: rangeStart(filters.range), cursor: filters.cursor, limit: 50 },
    }),
    allEndpoints(),
  ]);
  const filtered = !!(filters.status || filters.endpointId || filters.eventId || filters.range);

  return (
    <>
      <PageHeader title="Deliveries" description="Each delivery is one event sent to one endpoint, with every attempt it took." />
      <FilterBar
        filters={[
          { name: "status", label: "Any status", options: Object.entries(DELIVERY_LABELS).map(([value, label]) => ({ value, label })) },
          { name: "endpointId", label: "Any endpoint", options: endpoints.map((e) => ({ value: e.id, label: e.url })) },
          { name: "range", label: "Any time", options: RANGES },
        ]}
      />
      {page.data.length === 0 ? (
        <EmptyState icon={SendHorizontal} title={filtered ? "No deliveries match these filters" : "No deliveries yet"}>
          {filtered ? "Try a wider time range or another status." : "Deliveries appear here once an event is sent to a subscribed endpoint."}
        </EmptyState>
      ) : (
        <>
          <Panel>
            <DeliveryTable deliveries={page.data} endpoints={new Map(endpoints.map((e) => [e.id, e]))} />
          </Panel>
          <Pager path="/deliveries" params={filters} nextCursor={page.nextCursor} />
        </>
      )}
    </>
  );
}
