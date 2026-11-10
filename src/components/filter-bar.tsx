"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { selectClass } from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Filter = { name: string; label: string; options: { value: string; label: string }[] };

/** Filters live in the URL so a filtered view can be shared or bookmarked. */
export function FilterBar({ filters }: { filters: Filter[] }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const active = filters.some((f) => sp.get(f.name));

  const set = (name: string, value: string) => {
    const q = new URLSearchParams(sp);
    q.delete("cursor");
    if (value) q.set(name, value);
    else q.delete(name);
    start(() => router.push(q.size ? `${path}?${q}` : path));
  };

  return (
    <div className={cn("mb-3 flex flex-wrap items-center gap-2 transition-opacity", pending && "opacity-60")}>
      {filters.map((f) => (
        <label key={f.name} className="flex items-center">
          <span className="sr-only">{f.label}</span>
          <select
            value={sp.get(f.name) ?? ""}
            onChange={(e) => set(f.name, e.target.value)}
            className={cn(selectClass, "w-auto max-w-72 pr-7", sp.get(f.name) && "border-primary/40 bg-primary/5")}
          >
            <option value="">{f.label}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      {active && (
        <Button variant="ghost" size="sm" onClick={() => start(() => router.push(path))}>
          <X /> Clear filters
        </Button>
      )}
    </div>
  );
}

export const RANGES = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];
