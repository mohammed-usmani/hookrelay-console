import { Boxes } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CreateApplicationForm } from "@/components/admin-forms";
import { Id } from "@/components/copy-button";
import { EmptyState, PageHeader, Panel } from "@/components/page-header";
import { Pager, param } from "@/components/pager";
import { Pill } from "@/components/status";
import { Time } from "@/components/time";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/api";
import type { Application, Page } from "@/lib/types";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage({ searchParams }: PageProps<"/admin">) {
  const cursor = param(await searchParams, "cursor");
  const page = await adminApi<Page<Application>>("/v1/admin/applications", { query: { cursor, limit: 50 } });
  return (
    <>
      <PageHeader title="Applications" description="Each application is an isolated tenant with its own API keys." actions={page.data.length > 0 && <CreateApplicationForm />} />
      {page.data.length === 0 && !cursor ? (
        <EmptyState icon={Boxes} title="No applications yet" action={<CreateApplicationForm />}>
          Create one, then create an API key for it to sign in to the console or call the API.
        </EmptyState>
      ) : (
        <>
          <Panel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="hidden w-36 sm:table-cell">ID</TableHead>
                  <TableHead className="w-36 text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {page.data.map((a) => (
                  <TableRow key={a.id} className="relative">
                    <TableCell>
                      <Link href={`/admin/applications/${a.id}`} className="font-medium after:absolute after:inset-0">
                        {a.name}
                      </Link>
                    </TableCell>
                    <TableCell>{a.status === "ACTIVE" ? <Pill tone="ok">Active</Pill> : <Pill tone="bad">Disabled</Pill>}</TableCell>
                    <TableCell className="relative z-10 hidden sm:table-cell">
                      <Id value={a.id} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      <Time iso={a.createdAt} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
          <Pager path="/admin" params={{ cursor }} nextCursor={page.nextCursor} />
        </>
      )}
    </>
  );
}
