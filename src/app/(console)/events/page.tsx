import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Id } from "@/components/copy-button";
import { FilterBar, RANGES } from "@/components/filter-bar";
import { EmptyState, PageHeader, Panel } from "@/components/page-header";
import { Pager, param } from "@/components/pager";
import { SendEventForm } from "@/components/send-event-form";
import { Pill } from "@/components/status";
import { Time } from "@/components/time";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { allEventTypes } from "@/lib/data";
import { rangeStart } from "@/lib/ranges";
import type { Event, Page } from "@/lib/types";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage({ searchParams }: PageProps<"/events">) {
  const sp = await searchParams;
  const filters = { eventType: param(sp, "eventType"), range: param(sp, "range"), cursor: param(sp, "cursor") };
  const [page, types] = await Promise.all([
    api<Page<Event>>("/v1/events", { query: { eventType: filters.eventType, from: rangeStart(filters.range), cursor: filters.cursor, limit: 50 } }),
    allEventTypes(),
  ]);
  const filtered = !!(filters.eventType || filters.range);

  return (
    <>
      <PageHeader title="Events" description="Everything this application has sent. Each event fans out to the endpoints subscribed to its type." actions={<SendEventForm types={types} />} />
      <FilterBar
        filters={[
          { name: "eventType", label: "Any event type", options: types.map((t) => ({ value: t.name, label: t.name })) },
          { name: "range", label: "Any time", options: RANGES },
        ]}
      />
      {page.data.length === 0 ? (
        <EmptyState icon={Inbox} title={filtered ? "No events match these filters" : "No events yet"}>
          {filtered ? "Try a wider time range or another event type." : "Post to /v1/events from your backend, or send one from here to try it out."}
        </EmptyState>
      ) : (
        <>
          <Panel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event type</TableHead>
                  <TableHead className="w-36">ID</TableHead>
                  <TableHead className="w-36 text-right">Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {page.data.map((e) => (
                  <TableRow key={e.id} className="relative">
                    <TableCell>
                      <Link href={`/events/${e.id}`} className="font-mono text-[0.8rem] font-medium after:absolute after:inset-0">
                        {e.eventType}
                      </Link>
                      {e.payloadPurged && (
                        <Pill tone="idle" className="ml-2">
                          Payload removed
                        </Pill>
                      )}
                    </TableCell>
                    <TableCell className="relative z-10">
                      <Id value={e.id} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      <Time iso={e.createdAt} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
          <Pager path="/events" params={filters} nextCursor={page.nextCursor} />
        </>
      )}
    </>
  );
}
