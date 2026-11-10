"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { sendEvent } from "@/app/(console)/actions";
import { Field, FormDialog, selectClass } from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EventType } from "@/lib/types";

export function SendEventForm({ types, variant = "default" }: { types: EventType[]; variant?: "default" | "outline" }) {
  const postable = types.filter((t) => !t.system && !t.archived);
  const [type, setType] = useState(postable[0]?.name ?? "");
  const schema = postable.find((t) => t.name === type)?.schema;
  return (
    <FormDialog
      wide
      title="Send event"
      description="The event is delivered to every endpoint subscribed to its type, exactly as your backend would send it."
      submit="Send event"
      action={sendEvent}
      trigger={
        <Button variant={variant} disabled={postable.length === 0}>
          <Send /> Send event
        </Button>
      }
    >
      <Field label="Event type" htmlFor="eventType">
        <select id="eventType" name="eventType" required value={type} onChange={(e) => setType(e.target.value)} className={`${selectClass} font-mono`}>
          {postable.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Payload"
        htmlFor="payload"
        hint={schema ? "Checked against this event type's schema before it is accepted." : "Any JSON object, up to 256 KB."}
      >
        <Textarea id="payload" name="payload" rows={8} spellCheck={false} defaultValue={'{\n  \n}'} className="font-mono text-[0.8rem]" />
      </Field>
      <Field
        label="Idempotency key"
        htmlFor="idempotencyKey"
        optional
        hint="Sending again with the same key returns the original event instead of creating a duplicate."
      >
        <Input id="idempotencyKey" name="idempotencyKey" maxLength={255} className="font-mono" />
      </Field>
    </FormDialog>
  );
}
