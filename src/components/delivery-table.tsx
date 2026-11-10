import Link from "next/link";
import { DeliveryStatusPill } from "@/components/status";
import { Time } from "@/components/time";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deadReason } from "@/lib/format";
import type { Delivery, Endpoint } from "@/lib/types";

/** Shared by deliveries, endpoint detail, event detail and overview. */
export function DeliveryTable({
  deliveries,
  endpoints,
  hide = [],
}: {
  deliveries: Delivery[];
  endpoints: Map<string, Endpoint>;
  hide?: ("endpoint" | "event")[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-28">Status</TableHead>
          {!hide.includes("endpoint") && <TableHead>Endpoint</TableHead>}
          <TableHead>Detail</TableHead>
          <TableHead className="w-20 text-right">Attempts</TableHead>
          <TableHead className="w-36 text-right">Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveries.map((d) => {
          const ep = endpoints.get(d.endpointId);
          return (
            <TableRow key={d.id} className="relative">
              <TableCell>
                <Link href={`/deliveries/${d.id}`} className="after:absolute after:inset-0" aria-label={`Delivery ${d.id}`}>
                  <DeliveryStatusPill status={d.status} />
                </Link>
              </TableCell>
              {!hide.includes("endpoint") && (
                <TableCell className="max-w-64 truncate font-mono text-[0.8rem]" title={ep?.url}>
                  {ep ? ep.url : <span className="text-muted-foreground">Deleted endpoint</span>}
                </TableCell>
              )}
              <TableCell className="max-w-96 truncate text-muted-foreground">
                {d.status === "DEAD" ? (
                  deadReason(d.deadReason)
                ) : d.nextAttemptAt && d.status !== "SUCCEEDED" ? (
                  <>
                    Next attempt <Time iso={d.nextAttemptAt} />
                  </>
                ) : d.status === "SUCCEEDED" ? (
                  "Receiver returned 2xx"
                ) : (
                  d.lastError
                )}
              </TableCell>
              <TableCell className="text-right">{d.attemptCount}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                <Time iso={d.createdAt} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
