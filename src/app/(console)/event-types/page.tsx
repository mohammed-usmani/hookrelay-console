import { Braces } from "lucide-react";
import type { Metadata } from "next";
import { EventTypeForm, ArchiveButton } from "@/components/event-type-form";
import { EmptyState, PageHeader, Panel, Section } from "@/components/page-header";
import { Pill } from "@/components/status";
import { Time } from "@/components/time";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { allEventTypes } from "@/lib/data";
import type { EventType } from "@/lib/types";

export const metadata: Metadata = { title: "Event types" };

export default async function EventTypesPage() {
  const types = await allEventTypes();
  const custom = types.filter((t) => !t.system);
  const system = types.filter((t) => t.system);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Event types"
        description="The kinds of events this application sends. Endpoints subscribe to them by name."
        actions={custom.length > 0 && <EventTypeForm />}
      />
      {custom.length === 0 ? (
        <EmptyState icon={Braces} title="No event types yet" action={<EventTypeForm />}>
          Define one for each thing that happens in your product that other systems care about.
        </EmptyState>
      ) : (
        <Panel>
          <TypeTable types={custom.toSorted((a, b) => Number(a.archived) - Number(b.archived) || a.name.localeCompare(b.name))} editable />
        </Panel>
      )}
      {system.length > 0 && (
        <Section
          title="HookRelay notifications"
          description="Sent by HookRelay itself when a delivery fails for good or an endpoint is disabled. Subscribe an endpoint to them to get alerted."
        >
          <Panel>
            <TypeTable types={system} />
          </Panel>
        </Section>
      )}
    </div>
  );
}

function TypeTable({ types, editable }: { types: EventType[]; editable?: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-64">Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-24">Schema</TableHead>
          <TableHead className="hidden w-32 text-right sm:table-cell">Updated</TableHead>
          {editable && <TableHead className="w-20"><span className="sr-only">Actions</span></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {types.map((t) => (
          <TableRow key={t.name} className={t.archived ? "text-muted-foreground" : undefined}>
            <TableCell>
              <span className="font-mono text-[0.8rem] font-medium">{t.name}</span>
              {t.archived && (
                <Pill tone="idle" className="ml-2">
                  Archived
                </Pill>
              )}
            </TableCell>
            <TableCell className="max-w-0 truncate text-muted-foreground">{t.description || "—"}</TableCell>
            <TableCell className="text-muted-foreground">{t.schema ? "Validated" : "Any JSON"}</TableCell>
            <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
              <Time iso={t.updatedAt} />
            </TableCell>
            {editable && (
              <TableCell>
                <div className="flex justify-end gap-0.5">
                  {!t.archived && <EventTypeForm type={t} />}
                  <ArchiveButton type={t} />
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
