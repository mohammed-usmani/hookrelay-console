"use client";

import { Eye, EyeOff, FlaskConical, History, Pause, Play, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteEndpoint,
  pauseEndpoint,
  replayEndpoint,
  resumeEndpoint,
  revealSecret,
  rotateSecret,
  sendTest,
} from "@/app/(console)/actions";
import { ActionButton } from "@/components/action-button";
import { CopyButton } from "@/components/copy-button";
import { Field, FormDialog } from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Endpoint } from "@/lib/types";

export function SendTestButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <ActionButton
      variant="outline"
      action={sendTest.bind(null, id)}
      onDone={(deliveryId) => {
        router.refresh();
        toast.success("Test event sent", {
          action: deliveryId ? { label: "View delivery", onClick: () => router.push(`/deliveries/${deliveryId}`) } : undefined,
        });
      }}
    >
      <FlaskConical /> Send test event
    </ActionButton>
  );
}

export function PauseResumeButton({ endpoint }: { endpoint: Endpoint }) {
  if (endpoint.status === "ACTIVE") {
    return (
      <ActionButton
        variant="outline"
        action={pauseEndpoint.bind(null, endpoint.id)}
        confirm={{
          title: "Pause this endpoint?",
          description: "New events are kept and nothing is sent until you resume. Deliveries already in flight finish.",
          action: "Pause endpoint",
        }}
      >
        <Pause /> Pause
      </ActionButton>
    );
  }
  return (
    <ActionButton action={resumeEndpoint.bind(null, endpoint.id)}>
      <Play /> Resume
    </ActionButton>
  );
}

function localInput(d: Date) {
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

export function ReplayButton({ id }: { id: string }) {
  const [since] = useState(() => localInput(new Date(Date.now() - 24 * 3600_000)));
  const router = useRouter();
  return (
    <FormDialog
      title="Replay failed deliveries"
      description="Every delivery to this endpoint that ended in failure after the time below is queued again, oldest first."
      submit="Replay deliveries"
      action={replayEndpoint.bind(null, id)}
      onSuccess={() => router.refresh()}
      trigger={
        <Button variant="outline">
          <History /> Replay failed
        </Button>
      }
    >
      <Field label="Failed since" htmlFor="since" hint="Your local time.">
        <Input id="since" name="since" type="datetime-local" required defaultValue={since} max={localInput(new Date())} />
      </Field>
    </FormDialog>
  );
}

export function DeleteEndpointButton({ id }: { id: string }) {
  return (
    <ActionButton
      variant="destructive"
      action={deleteEndpoint.bind(null, id)}
      confirm={{
        title: "Delete this endpoint?",
        description: "It stops receiving events immediately and pending deliveries to it are cancelled. This can't be undone.",
        action: "Delete endpoint",
        destructive: true,
      }}
    >
      <Trash2 /> Delete endpoint
    </ActionButton>
  );
}

export function SigningSecret({ id }: { id: string }) {
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reveal = async () => {
    if (secret) return setSecret(null);
    setLoading(true);
    const r = await revealSecret(id);
    setLoading(false);
    if (r.ok) setSecret(r.data ?? null);
    else toast.error(r.error);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-lg border bg-muted/40 py-1 pr-1 pl-3">
        <code className="min-w-0 flex-1 truncate font-mono text-[0.8rem]">{secret ?? "whsec_" + "•".repeat(32)}</code>
        {secret && <CopyButton value={secret} label="Copy secret" />}
        <Button variant="ghost" size="sm" onClick={reveal} disabled={loading} aria-pressed={!!secret}>
          {secret ? <EyeOff /> : <Eye />}
          {secret ? "Hide" : "Reveal"}
        </Button>
      </div>
      <ActionButton
        variant="outline"
        size="sm"
        action={rotateSecret.bind(null, id)}
        onDone={(s: string | undefined) => s && setSecret(s)}
        confirm={{
          title: "Rotate signing secret?",
          description: "Requests are signed with both the new and the old secret for 24 hours, so you can update the receiver without dropping deliveries.",
          action: "Rotate secret",
        }}
      >
        <RefreshCw /> Rotate secret
      </ActionButton>
    </div>
  );
}
