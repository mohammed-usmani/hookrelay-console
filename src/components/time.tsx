"use client";

import { useSyncExternalStore } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { absolute, relative } from "@/lib/format";

// One shared clock for every timestamp on the page, ticking every 30 s.
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
function subscribe(cb: () => void) {
  now = Date.now();
  listeners.add(cb);
  timer ??= setInterval(() => {
    now = Date.now();
    listeners.forEach((l) => l());
  }, 30_000);
  return () => {
    listeners.delete(cb);
    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Relative time ("3 minutes ago") with the exact timestamp on hover. */
export function Time({ iso, className }: { iso: string | null | undefined; className?: string }) {
  const clock = useSyncExternalStore(subscribe, () => now, () => null);
  if (!iso) return <span className="text-muted-foreground">—</span>;
  return (
    <Tooltip>
      <TooltipTrigger render={<time dateTime={iso} className={className} />}>
        {clock === null ? absolute(iso) : relative(iso, clock)}
      </TooltipTrigger>
      <TooltipContent>{absolute(iso)}</TooltipContent>
    </Tooltip>
  );
}
