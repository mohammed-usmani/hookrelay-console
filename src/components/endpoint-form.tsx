"use client";

import { Pencil, Plus } from "lucide-react";
import { createEndpoint, updateEndpoint } from "@/app/(console)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Endpoint, EventType } from "@/lib/types";
import { EventTypePicker } from "./event-type-picker";
import { Field, FormDialog } from "./form-dialog";

export function EndpointForm({ types, endpoint }: { types: EventType[]; endpoint?: Endpoint }) {
  const editing = !!endpoint;
  return (
    <FormDialog
      wide
      title={editing ? "Edit endpoint" : "Add endpoint"}
      description={editing ? undefined : "HookRelay signs every request so the receiver can verify it came from you."}
      submit={editing ? "Save changes" : "Add endpoint"}
      action={editing ? updateEndpoint.bind(null, endpoint.id) : createEndpoint}
      trigger={
        editing ? (
          <Button variant="outline">
            <Pencil /> Edit
          </Button>
        ) : (
          <Button>
            <Plus /> Add endpoint
          </Button>
        )
      }
    >
      <Field label="URL" htmlFor="url" hint="Must be reachable from HookRelay. Private network addresses are blocked.">
        <Input id="url" name="url" type="url" required defaultValue={endpoint?.url} placeholder="https://api.example.com/webhooks" className="font-mono" />
      </Field>
      <Field label="Description" htmlFor="description" optional>
        <Input id="description" name="description" maxLength={500} defaultValue={endpoint?.description ?? ""} placeholder="Order sync service" />
      </Field>
      <EventTypePicker types={types} selected={endpoint?.eventTypes} />
      <Field
        label="Rate limit"
        htmlFor="rateLimitPerSec"
        optional
        hint="Maximum requests per second to this URL, across all HookRelay servers. Leave empty for no limit."
      >
        <div className="flex items-center gap-2">
          <Input
            id="rateLimitPerSec"
            name="rateLimitPerSec"
            type="number"
            min={1}
            max={10000}
            defaultValue={endpoint?.rateLimitPerSec ?? ""}
            className="w-32"
          />
          <span className="text-sm text-muted-foreground">per second</span>
        </div>
      </Field>
    </FormDialog>
  );
}
