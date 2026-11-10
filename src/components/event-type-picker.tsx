"use client";

import { useState } from "react";
import type { EventType } from "@/lib/types";

/** Empty selection means "every event type except HookRelay's own notifications". */
export function EventTypePicker({ types, selected = [] }: { types: EventType[]; selected?: string[] }) {
  const [picked, setPicked] = useState(new Set(selected));
  const custom = types.filter((t) => !t.system && (!t.archived || picked.has(t.name)));
  const system = types.filter((t) => t.system);
  const toggle = (n: string) =>
    setPicked((s) => {
      const next = new Set(s);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

  const row = (t: EventType) => (
    <label key={t.name} className="flex cursor-pointer items-start gap-2.5 px-3 py-2 hover:bg-muted/60">
      <input
        type="checkbox"
        name="eventTypes"
        value={t.name}
        checked={picked.has(t.name)}
        onChange={() => toggle(t.name)}
        className="mt-0.5 size-4 accent-primary"
      />
      <span className="min-w-0">
        <span className="block font-mono text-[0.8rem]">{t.name}</span>
        {t.description && <span className="block text-xs text-muted-foreground">{t.description}</span>}
      </span>
    </label>
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">Event types</span>
        {picked.size > 0 && (
          <button type="button" onClick={() => setPicked(new Set())} className="text-xs text-muted-foreground hover:text-foreground">
            Clear selection
          </button>
        )}
      </div>
      <div className="max-h-56 overflow-y-auto rounded-lg border">
        {custom.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">No event types defined yet.</p>}
        {custom.map(row)}
        {system.length > 0 && (
          <>
            <p className="border-t bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">HookRelay notifications</p>
            {system.map(row)}
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {picked.size === 0
          ? "Nothing selected: this endpoint receives every event type. HookRelay notifications must be picked explicitly."
          : `Receives ${picked.size} event ${picked.size === 1 ? "type" : "types"}.`}
      </p>
    </div>
  );
}
