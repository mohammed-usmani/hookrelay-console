import { KeyRound } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApplicationStatusButton, CreateKeyForm, RenameApplicationForm, RevokeKeyButton } from "@/components/admin-forms";
import { Id } from "@/components/copy-button";
import { EmptyState, PageHeader, Panel, Section } from "@/components/page-header";
import { Pill } from "@/components/status";
import { Time } from "@/components/time";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError, adminApi } from "@/lib/api";
import type { ApiKey, Application, Page } from "@/lib/types";

export const metadata: Metadata = { title: "Application" };

async function load(id: string) {
  try {
    return await Promise.all([adminApi<Application>(`/v1/admin/applications/${id}`), adminApi<Page<ApiKey>>(`/v1/admin/applications/${id}/api-keys`)]);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }
}

export default async function ApplicationPage({ params }: PageProps<"/admin/applications/[id]">) {
  const { id } = await params;
  const [app, keys] = await load(id);
  const sorted = keys.data.toSorted((a, b) => Number(!!a.revokedAt) - Number(!!b.revokedAt));
  return (
    <div className="space-y-8">
      <PageHeader
        crumbs={[{ href: "/admin", label: "Applications" }]}
        title={app.name}
        meta={
          <>
            {app.status === "ACTIVE" ? <Pill tone="ok">Active</Pill> : <Pill tone="bad">Disabled</Pill>}
            <span className="text-muted-foreground">
              Created <Time iso={app.createdAt} />
            </span>
            <Id value={app.id} />
          </>
        }
        actions={
          <>
            <RenameApplicationForm app={app} />
            <ApplicationStatusButton app={app} />
          </>
        }
      />
      <Section
        title="API keys"
        description="Keys authenticate both API calls and console sign-in. Only the prefix is stored in readable form."
        actions={sorted.length > 0 && <CreateKeyForm appId={app.id} />}
      >
        {sorted.length === 0 ? (
          <EmptyState icon={KeyRound} title="No API keys" action={<CreateKeyForm appId={app.id} />}>
            Create a key to call the API or sign in to this application&apos;s console.
          </EmptyState>
        ) : (
          <Panel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-44">Key</TableHead>
                  <TableHead className="w-32">Last used</TableHead>
                  <TableHead className="hidden w-32 sm:table-cell">Created</TableHead>
                  <TableHead className="w-24 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((k) => (
                  <TableRow key={k.id} className={k.revokedAt ? "text-muted-foreground" : undefined}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell className="font-mono text-[0.8rem]">hr_live_{k.prefix}…</TableCell>
                    <TableCell className="text-muted-foreground">{k.lastUsedAt ? <Time iso={k.lastUsedAt} /> : "Never"}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      <Time iso={k.createdAt} />
                    </TableCell>
                    <TableCell className="text-right">
                      {k.revokedAt ? <Pill tone="idle">Revoked</Pill> : <RevokeKeyButton appId={app.id} keyId={k.id} name={k.name} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        )}
      </Section>
    </div>
  );
}
