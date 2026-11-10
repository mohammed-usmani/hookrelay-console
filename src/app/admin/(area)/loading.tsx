import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-2 h-6 w-48" />
      <Skeleton className="mb-8 h-4 w-80" />
      <div className="space-y-px overflow-hidden rounded-lg border">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-11 rounded-none" />
        ))}
      </div>
    </div>
  );
}
