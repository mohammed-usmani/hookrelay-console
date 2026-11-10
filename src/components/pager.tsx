import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Keyset pages: the API only knows "after this row", so we offer newest and older. */
export function Pager({
  path,
  params,
  nextCursor,
}: {
  path: string;
  params: Record<string, string | undefined>;
  nextCursor: string | null;
}) {
  const onFirst = !params.cursor;
  if (onFirst && !nextCursor) return null;
  const href = (cursor?: string) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "cursor") q.set(k, v);
    if (cursor) q.set("cursor", cursor);
    const s = q.toString();
    return s ? `${path}?${s}` : path;
  };
  const cls = buttonVariants({ variant: "outline", size: "sm" });
  return (
    <nav aria-label="Pagination" className="flex items-center justify-end gap-2 pt-3">
      {onFirst ? (
        <span className={cn(cls, "pointer-events-none opacity-50")}>
          <ChevronLeft /> Newest
        </span>
      ) : (
        <Link href={href()} className={cls}>
          <ChevronLeft /> Newest
        </Link>
      )}
      {nextCursor ? (
        <Link href={href(nextCursor)} className={cls}>
          Older <ChevronRight />
        </Link>
      ) : (
        <span className={cn(cls, "pointer-events-none opacity-50")}>
          Older <ChevronRight />
        </span>
      )}
    </nav>
  );
}

/** Reads one string search param. */
export function param(sp: Record<string, string | string[] | undefined>, k: string): string | undefined {
  const v = sp[k];
  return typeof v === "string" && v ? v : undefined;
}
