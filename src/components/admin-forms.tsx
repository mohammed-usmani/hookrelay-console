"use client";

import { AlertTriangle, KeyRound, Pencil, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { createApiKey, createApplication, renameApplication, revokeApiKey, setApplicationStatus } from "@/app/admin/actions";
import { ActionButton } from "@/components/action-button";
import { CopyButton } from "@/components/copy-button";
import { Field, FormDialog } from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Application } from "@/lib/types";

export function CreateApplicationForm() {
  return (
    <FormDialog
      title="Create application"
      description="An application is one tenant: its own event types, endpoints, events and API keys."
      submit="Create application"
      action={createApplication}
      trigger={
        <Button>
          <Plus /> Create application
        </Button>
      }
    >
      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" required maxLength={200} placeholder="Acme Storefront" autoFocus />
      </Field>
    </FormDialog>
  );
}

export function RenameApplicationForm({ app }: { app: Application }) {
  return (
    <FormDialog
      title="Rename application"
      submit="Save name"
      action={renameApplication.bind(null, app.id)}
      trigger={
        <Button variant="outline">
          <Pencil /> Rename
        </Button>
      }
    >
      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" required maxLength={200} defaultValue={app.name} />
      </Field>
    </FormDialog>
  );
}

export function ApplicationStatusButton({ app }: { app: Application }) {
  return app.status === "ACTIVE" ? (
    <ActionButton
      variant="outline"
      action={setApplicationStatus.bind(null, app.id, "DISABLED")}
      confirm={{
        title: `Disable ${app.name}?`,
        description: "Its API keys stop working immediately, so it can't send events or manage endpoints until you enable it again.",
        action: "Disable application",
        destructive: true,
      }}
    >
      <PowerOff /> Disable
    </ActionButton>
  ) : (
    <ActionButton action={setApplicationStatus.bind(null, app.id, "ACTIVE")}>
      <Power /> Enable
    </ActionButton>
  );
}

export function CreateKeyForm({ appId }: { appId: string }) {
  const [key, setKey] = useState<string | null>(null);
  return (
    <>
      <FormDialog
        title="Create API key"
        description="Name it after where it will be used, so you know what breaks if you revoke it."
        submit="Create key"
        action={createApiKey.bind(null, appId)}
        onSuccess={(k: string | undefined) => k && setKey(k)}
        trigger={
          <Button variant="outline" size="sm">
            <KeyRound /> Create key
          </Button>
        }
      >
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" required maxLength={200} placeholder="Production backend" />
        </Field>
      </FormDialog>
      <Dialog open={key !== null} onOpenChange={(o) => !o && setKey(null)}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Copy your new API key</DialogTitle>
            <DialogDescription className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
              This is the only time the full key is shown. Store it in your secret manager now.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 py-1 pr-1 pl-3">
            <code className="min-w-0 flex-1 font-mono text-[0.8rem] break-all">{key}</code>
            {key && <CopyButton value={key} label="Copy key" />}
          </div>
          <DialogFooter>
            <Button onClick={() => setKey(null)}>I&apos;ve stored the key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function RevokeKeyButton({ appId, keyId, name }: { appId: string; keyId: string; name: string }) {
  return (
    <ActionButton
      variant="ghost"
      size="icon-sm"
      aria-label={`Revoke ${name}`}
      title="Revoke"
      action={revokeApiKey.bind(null, appId, keyId)}
      confirm={{
        title: `Revoke ${name}?`,
        description: "Requests using this key start failing with 401 immediately. This can't be undone.",
        action: "Revoke key",
        destructive: true,
      }}
    >
      <Trash2 />
    </ActionButton>
  );
}
