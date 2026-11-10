"use client";

import { Archive, ArchiveRestore, Pencil, Plus } from "lucide-react";
import { createEventType, setEventTypeArchived, updateEventType } from "@/app/(console)/actions";
import { ActionButton } from "@/components/action-button";
import { Field, FormDialog } from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EventType } from "@/lib/types";

export function EventTypeForm({ type }: { type?: EventType }) {
  const editing = !!type;
  return (
    <FormDialog
      wide
      title={editing ? `Edit ${type.name}` : "Add event type"}
      submit={editing ? "Save changes" : "Add event type"}
      action={editing ? updateEventType.bind(null, type.name) : createEventType}
      trigger={
        editing ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${type.name}`}>
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus /> Add event type
          </Button>
        )
      }
    >
      {!editing && (
        <Field label="Name" htmlFor="name" hint="Lowercase words separated by dots, like order.created. It can't be changed later.">
          <Input id="name" name="name" required maxLength={100} pattern="[a-z0-9_]+(\.[a-z0-9_]+)+" placeholder="order.created" className="font-mono" />
        </Field>
      )}
      <Field label="Description" htmlFor="description" optional>
        <Input id="description" name="description" maxLength={500} defaultValue={type?.description ?? ""} placeholder="A customer placed an order" />
      </Field>
      <Field
        label="JSON schema"
        htmlFor="schema"
        optional
        hint="Events whose payload doesn't match are rejected with the list of errors. Remote $ref links are not followed."
      >
        <Textarea
          id="schema"
          name="schema"
          rows={9}
          spellCheck={false}
          defaultValue={type?.schema ? JSON.stringify(type.schema, null, 2) : ""}
          placeholder={'{\n  "type": "object",\n  "required": ["orderId"],\n  "properties": { "orderId": { "type": "string" } }\n}'}
          className="font-mono text-[0.8rem]"
        />
      </Field>
    </FormDialog>
  );
}

export function ArchiveButton({ type }: { type: EventType }) {
  return type.archived ? (
    <ActionButton variant="ghost" size="icon-sm" aria-label={`Restore ${type.name}`} title="Restore" action={setEventTypeArchived.bind(null, type.name, false)}>
      <ArchiveRestore />
    </ActionButton>
  ) : (
    <ActionButton
      variant="ghost"
      size="icon-sm"
      aria-label={`Archive ${type.name}`}
      title="Archive"
      action={setEventTypeArchived.bind(null, type.name, true)}
      confirm={{
        title: `Archive ${type.name}?`,
        description: "New events of this type will be rejected. Existing events and deliveries are kept, and you can restore it at any time.",
        action: "Archive",
      }}
    >
      <Archive />
    </ActionButton>
  );
}
