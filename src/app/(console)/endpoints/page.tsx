import { Webhook } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EndpointForm } from "@/components/endpoint-form";
import { EmptyState, PageHeader, Panel } from "@/components/page-header";
import { Pager, param } from "@/components/pager";
import { CircuitPill, EndpointStatusPill } from "@/components/status";
import { Time } from "@/components/time";
import { Toast } from "@/components/toast-on-load";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { allEventTypes } from "@/lib/data";
import type { Endpoint, Page } from "@/lib/types";

export const metadata: Metadata = { title: "Endpoints" };

export default async function EndpointsPage({ searchParams }: PageProps<"/endpoints">) {
  const sp = await searchParams;
  const cursor = param(sp, "cursor");
  const [page, types] = await Promise.all([
    api<Page<Endpoint>>("/v1/endpoints", { query: { cursor, limit: 50 } }),
    allEventTypes(),
  ]);

  return (
    <>
      {param(sp, "deleted") && <Toast message="Endpoint deleted" />}
      <PageHeader
        title="Endpoints"
        description="URLs that receive this application's webhooks."
        actions={page.data.length > 0 && <EndpointForm types={types} />}
      />
      {page.data.length === 0 && !cursor ? (
        <EmptyState icon={Webhook} title="No endpoints yet" action={<EndpointForm types={types} />}>
          Add the URL of a service that should receive events. You can limit it to specific event types.
        </EmptyState>
      ) : (
        <>
          <Panel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-28">Health</TableHead>
                  <TableHead className="hidden w-40 lg:table-cell">Receives</TableHead>
                  <TableHead className="hidden w-32 text-right sm:table-cell">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {page.data.map((e) => (
                  <TableRow key={e.id} className="relative">
                    <TableCell className="max-w-0 w-full">
                      <Link href={`/endpoints/${e.id}`} className="block truncate font-mono text-[0.8rem] font-medium after:absolute after:inset-0">
                        {e.url}
                      </Link>
                      {e.description && <span className="block truncate text-xs text-muted-foreground">{e.description}</span>}
                    </TableCell>
                    <TableCell>
                      <EndpointStatusPill status={e.status} />
                    </TableCell>
                    <TableCell>{e.status === "ACTIVE" ? <CircuitPill state={e.circuitState} /> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {e.eventTypes.length === 0 ? "All events" : e.eventTypes.length === 1 ? <span className="font-mono text-[0.8rem]">{e.eventTypes[0]}</span> : `${e.eventTypes.length} event types`}
                    </TableCell>
                    <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                      <Time iso={e.createdAt} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
          <Pager path="/endpoints" params={{ cursor }} nextCursor={page.nextCursor} />
        </>
      )}
    </>
  );
}
